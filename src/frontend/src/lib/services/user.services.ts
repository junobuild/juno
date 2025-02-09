import type { CollectionType } from '$declarations/satellite/satellite.did';
import { getDoc, listRules } from '$lib/api/satellites.api';
import { DbCollectionType, StorageCollectionType } from '$lib/constants/rules.constants';
import { busy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { User } from '$lib/types/user';
import type { UserUsage, UserUsageCollection } from '$lib/types/user-usage';
import { emit } from '$lib/utils/events.utils';
import { waitReady } from '$lib/utils/timeout.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, isNullish } from '@dfinity/utils';
import { fromArray } from '@junobuild/utils';
import { get } from 'svelte/store';

interface OpenUserDetailParams {
	user: User;
	satelliteId: Principal;
	identity: OptionIdentity;
}

export const openUserDetail = async ({ user, satelliteId, identity }: OpenUserDetailParams) => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		busy.start();

		const waitLoadUserUsages = (): Promise<UserUsageCollection[]> =>
			// eslint-disable-next-line no-async-promise-executor, require-await
			new Promise<UserUsageCollection[]>(async (resolve, reject) => {
				let usages: UserUsageCollection[] | undefined = undefined;

				const isDisabled = (): boolean => isNullish(usages);

				try {
					usages = await loadUserUsages({ identity, user, satelliteId });
				} catch (_err: unknown) {
					reject();
					return;
				}

				waitReady({ isDisabled, retries: 10 }).then((status) =>
					status === 'timeout' ? reject() : resolve(usages ?? [])
				);
			});

		const usages = await waitLoadUserUsages();

		emit({
			message: 'junoModal',
			detail: {
				type: 'show_user_details',
				detail: {
					user,
					usages
				}
			}
		});
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.user_usage_not_loaded,
			detail: err
		});
	} finally {
		busy.stop();
	}
};

const loadUserUsages = async ({
	identity,
	user,
	satelliteId
}: { identity: Identity } & Omit<OpenUserDetailParams, 'identity'>): Promise<
	UserUsageCollection[]
> => {
	const [dbRules, storageRules] = await Promise.all([
		listRules({ satelliteId, type: DbCollectionType, identity }),
		listRules({ satelliteId, type: StorageCollectionType, identity })
	]);

	const loadUsage = async ({
		collection,
		collectionType,
		maxChangesPerUser
	}: {
		collection: string;
		collectionType: CollectionType;
		maxChangesPerUser: number | undefined;
	}): Promise<UserUsageCollection> => {
		const key = `${user.owner.toText()}#${collection}`;

		const userUsageCollection =
			'Storage' in collectionType ? '#user_usage_storage' : '#user_usage_db';

		const result = await getDoc({
			satelliteId,
			collection: userUsageCollection,
			key,
			identity
		});

		const doc = fromNullable(result);

		const usage = isNullish(doc) ? undefined : await fromArray<UserUsage>(doc.data);

		return {
			collection,
			collectionType,
			maxChangesPerUser,
			usage
		};
	};

	const promises = [
		...dbRules.map(([collection, { max_changes_per_user }]) =>
			loadUsage({
				collection,
				collectionType: DbCollectionType,
				maxChangesPerUser: fromNullable(max_changes_per_user)
			})
		),
		...storageRules.map(([collection, { max_changes_per_user }]) =>
			loadUsage({
				collection,
				collectionType: StorageCollectionType,
				maxChangesPerUser: fromNullable(max_changes_per_user)
			})
		)
	];

	return await Promise.all(promises);
};
