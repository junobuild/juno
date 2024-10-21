import type { TransferArg, TransferArgs } from '$declarations/mission_control/mission_control.did';
import { icpTransfer, icrcTransfer } from '$lib/api/mission-control.api';
import { ICP_LEDGER_CANISTER_ID, IC_TRANSACTION_FEE_ICP } from '$lib/constants/constants';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { nowInBigIntNanoSeconds } from '$lib/utils/date.utils';
import { invalidIcpAddress } from '$lib/utils/icp-account.utils';
import { invalidIcrcAddress } from '$lib/utils/icrc-account.utils';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { decodeIcrcAccount } from '@dfinity/ledger-icrc';
import { Principal } from '@dfinity/principal';
import { isNullish, toNullable, type TokenAmountV2 } from '@dfinity/utils';
import { get } from 'svelte/store';

export const sendTokens = async ({
	destination,
	token,
	identity,
	missionControlId
}: {
	destination: string;
	token: TokenAmountV2 | undefined;
	identity: OptionIdentity;
	missionControlId: Principal;
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

	try {
		const fn = !invalidIcpAddress(destination) ? sendIcp : sendIcrc;

		await fn({
			destination,
			token,
			identity,
			missionControlId
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

export const sendIcrc = async ({
	destination,
	token,
	...rest
}: {
	destination: string;
	token: TokenAmountV2;
	identity: OptionIdentity;
	missionControlId: Principal;
}): Promise<void> => {
	const { owner, subaccount } = decodeIcrcAccount(destination);

	const args: TransferArg = {
		to: {
			owner,
			subaccount: toNullable(subaccount)
		},
		amount: token.toE8s(),
		fee: toNullable(IC_TRANSACTION_FEE_ICP),
		memo: toNullable(),
		from_subaccount: toNullable(),
		created_at_time: toNullable(nowInBigIntNanoSeconds())
	};

	await icrcTransfer({
		args,
		ledgerId: Principal.fromText(ICP_LEDGER_CANISTER_ID),
		...rest
	});
};

export const sendIcp = async ({
	destination,
	token,
	...rest
}: {
	destination: string;
	token: TokenAmountV2;
	identity: OptionIdentity;
	missionControlId: Principal;
}): Promise<void> => {
	const args: TransferArgs = {
		to: AccountIdentifier.fromHex(destination).toUint8Array(),
		amount: { e8s: token.toE8s() },
		fee: { e8s: IC_TRANSACTION_FEE_ICP },
		memo: 0n,
		created_at_time: toNullable({ timestamp_nanos: nowInBigIntNanoSeconds() }),
		from_subaccount: toNullable()
	};

	await icpTransfer({
		args,
		...rest
	});
};
