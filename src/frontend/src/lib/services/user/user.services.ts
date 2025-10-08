import { getDoc, listRules, setDoc } from '$lib/api/satellites.api';
import { listRules0022 } from '$lib/api/satellites.deprecated.api';
import {
	DbCollectionType,
	filterSystemRules,
	StorageCollectionType
} from '$lib/constants/rules.constants';
import { SATELLITE_v0_1_0 } from '$lib/constants/version.constants';
import { isSatelliteFeatureSupported } from '$lib/services/feature.services';
import { busy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { SatelliteDid } from '$lib/types/declarations';
import type { OptionIdentity } from '$lib/types/itentity';
import type { PaginationContext } from '$lib/types/pagination.context';
import type { User } from '$lib/types/user';
import type { UserUsage, UserUsageCollection } from '$lib/types/user-usage';
import { emit } from '$lib/utils/events.utils';
import { waitReady } from '$lib/utils/timeout.utils';
import { toKeyUser } from '$lib/utils/user.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, isNullish } from '@dfinity/utils';
import { fromArray, toArray } from '@junobuild/utils';
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
			// eslint-disable-next-line no-async-promise-executor
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
	const newestListRules = isSatelliteFeatureSupported({
		satelliteId,
		requiredMinVersion: SATELLITE_v0_1_0
	});

	const modernListRules = async (
		collectionType: SatelliteDid.CollectionType
	): Promise<[string, SatelliteDid.Rule][]> => {
		const { items } = await listRules({
			satelliteId,
			type: collectionType,
			filter: filterSystemRules,
			identity
		});
		return items;
	};

	const [dbRules, storageRules] = await Promise.all([
		newestListRules
			? modernListRules(DbCollectionType)
			: listRules0022({ satelliteId, type: DbCollectionType, identity }),
		newestListRules
			? modernListRules(StorageCollectionType)
			: listRules0022({ satelliteId, type: DbCollectionType, identity })
	]);

	const loadUsage = async ({
		collection,
		collectionType,
		maxChangesPerUser
	}: {
		collection: string;
		collectionType: SatelliteDid.CollectionType;
		maxChangesPerUser: number | undefined;
	}): Promise<UserUsageCollection> => {
		const key = `${user.owner.toText()}#${'Storage' in collectionType ? 'storage' : 'db'}#${collection}`;

		const result = await getDoc({
			satelliteId,
			collection: '#user-usage',
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

export type BanUser = {
	user: User;
	identity: OptionIdentity;
	satelliteId: Principal;
} & Pick<PaginationContext<User>, 'setItem'>;

export const banUser = async (params: BanUser): Promise<{ success: boolean }> =>
	await updateUser({
		...params,
		action: 'ban'
	});

export const unbanUser = async (params: BanUser): Promise<{ success: boolean }> =>
	await updateUser({
		...params,
		action: 'unban'
	});

const updateUser = async ({
	action,
	identity,
	user,
	satelliteId,
	setItem
}: BanUser & { action: 'ban' | 'unban' }): Promise<{ success: boolean }> => {
	busy.start();

	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const { data: currentData, ...rest } = user;

		const data = await toArray({
			...currentData,
			banned: action === 'ban' ? 'indefinite' : undefined
		});

		const key = user.owner.toText();

		// Ban or unban user
		const updatedUser = await setDoc({
			identity,
			satelliteId,
			collection: '#user',
			key,
			doc: {
				...rest,
				data
			}
		});

		// Update UI
		const itemUser = await toKeyUser([key, updatedUser]);
		setItem(itemUser);

		return { success: true };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: action === 'ban' ? labels.errors.user_ban : labels.errors.user_unban,
			detail: err
		});

		return { success: false };
	} finally {
		busy.stop();
	}
};
