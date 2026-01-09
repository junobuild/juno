import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import { ICP } from '$lib/constants/token.constants';
import type { SelectedWallet } from '$lib/schemas/wallet.schema';
import { approveConvertIcpToCycles } from '$lib/services/wallet/wallet.approve.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertAndConvertAmountToToken } from '$lib/utils/token.utils';
import { assertNonNullish, isEmptyString, isNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

export const convertIcpToCycles = async ({
	identity,
	selectedWallet,
	balance,
	amount
}: {
	identity: OptionIdentity;
	selectedWallet: SelectedWallet;
	balance: bigint;
	amount: string | undefined;
}): Promise<{ success: 'ok' | 'error'; err?: unknown }> => {
	if (isEmptyString(amount)) {
		toasts.error({
			text: get(i18n).errors.invalid_amount_to_top_up
		});
		return { success: 'error' };
	}

	const { valid, tokenAmount } = assertAndConvertAmountToToken({
		balance,
		amount,
		token: ICP.token,
		fee: ICP.fees.topUp // TODO: ?
	});

	if (!valid || isNullish(tokenAmount)) {
		return { success: 'error' };
	}

	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const { type: walletType, walletId } = selectedWallet;

		await approveConvertIcpToCycles({
			identity,
			amount: tokenAmount.toE8s()
		});

		// TODO: in the api too
		const { convert_icp_to_cycles } = await getConsoleActor({
			identity
		});

		await convert_icp_to_cycles({
			from: {
				owner: selectedWallet.walletId.owner,
				subaccount: toNullable(selectedWallet.walletId.subaccount)
			},
			amount: tokenAmount.toE8s()
		});
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.top_up_error,
			detail: err
		});

		return { success: 'error', err };
	}

	return { success: 'ok' };
};
