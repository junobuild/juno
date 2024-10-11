import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { invalidIcpAddress } from '$lib/utils/icp-account.utils';
import { invalidIcrcAddress } from '$lib/utils/icrc-account.utils';
import type { Identity } from '@dfinity/agent';
import { decodeIcrcAccount } from '@dfinity/ledger-icrc';
import { isNullish, type TokenAmountV2 } from '@dfinity/utils';
import { get } from 'svelte/store';
import {icpTransfer} from "$lib/api/mission-control.api";
import type {TransferArgs} from "$declarations/mission_control/mission_control.did";
import {AccountIdentifier} from "@dfinity/ledger-icp";
import {toTransferRawRequest} from "@dfinity/ledger-icp/dist/types/canisters/ledger/ledger.request.converts";

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

		await sendIcp({
			destination,
			token,
			identity
		})

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

export const sendIcp = async ({
									 destination,
									 token,
									 identity
								 }: {
	destination: string;
	token: TokenAmountV2;
	identity: Identity | undefined | null;
}): Promise<void> => {
	const args: TransferArgs = toTransferRawRequest()

	await icpTransfer({
		identity,
		to: destination,
		amount
	});
}