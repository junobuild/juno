import { icrc1Transfer, transfer } from '$lib/api/icp-ledger.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { invalidIcpAddress } from '$lib/utils/icp-account.utils';
import { invalidIcrcAddress } from '$lib/utils/icrc-account.utils';
import type { Identity } from '@dfinity/agent';
import { decodeIcrcAccount } from '@dfinity/ledger-icrc';
import { isNullish, type TokenAmountV2 } from '@dfinity/utils';
import { get } from 'svelte/store';

export const sendTokens = async ({
	destination,
	token,
	identity
}: {
	destination: string;
	token: TokenAmountV2 | undefined;
	identity: Identity | undefined | null;
}): Promise<{ success: boolean }> => {
	const notIcp = invalidIcpAddress(destination);
	const notIcrc = invalidIcrcAddress(destination);

	console.log(token?.toE8s(), destination)

	if (notIcp && notIcrc) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.invalid_destination
		});
		return { success: false };
	}

	if (isNullish(token)) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.empty_amount
		});
		return { success: false };
	}

	const amount = token.toE8s();

	try {
		// TODO: the send should happens within the mission control

		if (!invalidIcrcAddress) {
			await icrc1Transfer({
				identity,
				to: decodeIcrcAccount(destination),
				amount
			});
			return { success: true };
		}

		await transfer({
			identity,
			to: destination,
			amount
		});

		return { success: true };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.sending_error,
			detail: err
		});

		return { success: false };
	}
};
