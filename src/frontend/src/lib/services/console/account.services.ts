import type { ConsoleDid } from '$declarations';
import {
	getAccount as getAccountApi,
	getOrInitAccount as getOrInitAccountApi
} from '$lib/api/console.api';
import { accountErrorSignOut } from '$lib/services/console/auth/auth.services';
import { i18n } from '$lib/stores/i18n.store';
import { accountCertifiedStore } from '$lib/stores/mission-control.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { isNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { get } from 'svelte/store';

interface Certified {
	certified: boolean;
}

type PollAndInitResult = {
	account: ConsoleDid.Account;
} & Certified;

export const initAccount = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	// If not signed in, we are not going to init and load a mission control.
	if (isNullish(identity)) {
		return { result: 'skip' };
	}

	try {
		const { account, certified } = await getOrInitAccount({
			identity
		});

		accountCertifiedStore.set({
			data: account,
			certified
		});

		if (certified) {
			return { result: 'success' };
		}

		// We deliberately do not await the promise to avoid blocking the main UX. However, if necessary, we take the required measures if Mission Control cannot be certified.
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

export const getOrInitAccount = async ({
	identity
}: {
	identity: Identity;
}): Promise<{ account: ConsoleDid.Account } & Certified> => {
	const existingAccount = await getOrInitAccountApi({ identity, certified: false });

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
