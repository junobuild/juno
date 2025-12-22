import type { ConsoleDid } from '$declarations';
import type { GetActorParams } from '$lib/api/actors/actor.api';
import {
	getAccount as getAccountApi,
	getOrInitAccount as getOrInitAccountApi
} from '$lib/api/console.api';
import { accountErrorSignOut } from '$lib/services/console/auth/auth.services';
import { accountCertifiedStore } from '$lib/stores/account.store';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { isNullish, nonNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { get } from 'svelte/store';

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
		const { account: uncertifiedAccount } = await getAccount({
			identity,
			certified: false
		});

		if (nonNullish(uncertifiedAccount)) {
			accountCertifiedStore.set({
				data: uncertifiedAccount,
				certified: false
			});

			// We deliberately do not await the promise to avoid blocking the main UX. However, if necessary, we take the required measures if the account cannot be certified.
			assertAccount({ identity });

			return { result: 'success' };
		}

		// No account was found with the query so we either create it, if the previous answer was not hijacked,
		// or the call will effectively return the certified account that already existing.
		// Note: From a performance perspective it's not an overhead in comparison to asserting the account anyway.
		const { account: certifiedAccount } = await getOrInitAccount({ identity });

		accountCertifiedStore.set({
			data: certifiedAccount,
			certified: true
		});

		return { result: 'success' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.initializing_account,
			detail: err
		});

		// There was an error so, we sign the user out otherwise skeleton and other spinners will be displayed forever
		await accountErrorSignOut();

		return { result: 'error' };
	}
};

const getAccount = async ({
	identity,
	certified
}: Required<GetActorParams>): Promise<{ account: ConsoleDid.Account | undefined }> => {
	const existingAccount = await getAccountApi({ identity, certified });

	return {
		account: existingAccount
	};
};

const getOrInitAccount = async ({
	identity
}: {
	identity: Identity;
}): Promise<{ account: ConsoleDid.Account }> => {
	const existingAccount = await getOrInitAccountApi({ identity });

	return {
		account: existingAccount
	};
};

const assertAccount = async ({ identity }: { identity: Identity }) => {
	try {
		const { account: certifiedAccount } = await getAccount({ identity, certified: true });

		// Unlikely as assertAccount is supposed to be called only to validate the existence of existing account
		if (isNullish(certifiedAccount)) {
			await accountErrorSignOut();
			return;
		}

		accountCertifiedStore.set({
			data: certifiedAccount,
			certified: true
		});
	} catch (_err: unknown) {
		await accountErrorSignOut();
	}
};

export const reloadAccount = async ({
	identity
}: {
	identity: Identity;
}): Promise<{ result: 'success' | 'error' }> => {
	try {
		const certified = true;

		const account = await getAccountApi({
			identity,
			certified
		});

		accountCertifiedStore.set({
			data: account,
			certified
		});

		return { result: 'success' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.initializing_account,
			detail: err
		});

		return { result: 'error' };
	}
};
