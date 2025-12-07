import type { ConsoleDid } from '$declarations';
import {
	getAccount as getAccountApi,
	initAccountAndMissionControl as initAccountAndMissionControlApi
} from '$lib/api/console.api';
import { accountErrorSignOut } from '$lib/services/console/auth/auth.services';
import { accountCertifiedStore } from '$lib/stores/account.store';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { fromNullable, isNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { get } from 'svelte/store';

interface Certified {
	certified: boolean;
}

type PollAndInitResult = {
	account: ConsoleDid.Account;
} & Certified;

export const initAccountAndMissionControl = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	// If not signed in, we are not going to init and load a mission control.
	if (isNullish(identity)) {
		return { result: 'skip' };
	}

	try {
		// Poll to init mission control center
		const { account, certified } = await pollAndInitMissionControl({
			identity
		});

		accountCertifiedStore.set({
			data: account,
			certified
		});

		if (certified) {
			return { result: 'success' };
		}

		// We deliberately do not await the promise to avoid blocking the main UX. However, if necessary, we take the required measures if the account cannot be certified.
		assertAccount({ identity });

		return { result: 'success' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.initializing_mission_control,
			detail: err
		});

		// There was an error so, we sign the user out otherwise skeleton and other spinners will be displayed forever
		await accountErrorSignOut();

		return { result: 'error' };
	}
};

const pollAndInitMissionControl = async ({
	identity
}: {
	identity: Identity;
	// eslint-disable-next-line require-await
}): Promise<PollAndInitResult> =>
	// eslint-disable-next-line no-async-promise-executor
	new Promise<PollAndInitResult>(async (resolve, reject) => {
		try {
			const { account, certified } = await getOrInitMissionControl({
				identity
			});

			const missionControlId = fromNullable(account.mission_control_id);

			// TODO: we can/should probably add a max time to not retry forever even though the user will probably close their browsers.
			if (isNullish(missionControlId)) {
				setTimeout(async () => {
					try {
						const result = await pollAndInitMissionControl({ identity });
						resolve(result);
					} catch (err: unknown) {
						reject(err);
					}
				}, 2000);
				return;
			}

			resolve({ account, certified });
		} catch (err: unknown) {
			reject(err);
		}
	});

export const getOrInitMissionControl = async ({
	identity
}: {
	identity: Identity;
}): Promise<{ account: ConsoleDid.Account } & Certified> => {
	const existingAccount = await getAccountApi({ identity, certified: false });

	if (isNullish(existingAccount)) {
		const newAccount = await initAccountAndMissionControlApi(identity);

		return {
			account: newAccount,
			certified: true
		};
	}

	return {
		account: existingAccount,
		certified: false
	};
};

const assertAccount = async ({ identity }: { identity: Identity }) => {
	try {
		await getAccountApi({ identity, certified: true });
	} catch (_err: unknown) {
		await accountErrorSignOut();
	}
};
