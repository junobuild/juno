import { icpTransfer, icrcTransfer } from '$lib/api/mission-control.api';
import { ICP_LEDGER_CANISTER_ID, IC_TRANSACTION_FEE_ICP } from '$lib/constants/app.constants';
import { execute } from '$lib/services/progress.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { MissionControlDid } from '$lib/types/declarations';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import { type SendTokensProgress, SendTokensProgressStep } from '$lib/types/progress-send-tokens';
import type { Option } from '$lib/types/utils';
import { nowInBigIntNanoSeconds } from '$lib/utils/date.utils';
import { invalidIcpAddress } from '$lib/utils/icp-account.utils';
import { invalidIcrcAddress } from '$lib/utils/icrc-account.utils';
import { waitAndRestartWallet } from '$lib/utils/wallet.utils';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { decodeIcrcAccount } from '@dfinity/ledger-icrc';
import { Principal } from '@dfinity/principal';
import { type TokenAmountV2, assertNonNullish, isNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

export const sendTokens = async ({
	destination,
	token,
	identity,
	missionControlId,
	onProgress
}: {
	destination: string;
	token: TokenAmountV2 | undefined;
	identity: OptionIdentity;
	missionControlId: Option<MissionControlId>;
	onProgress: (progress: SendTokensProgress | undefined) => void;
}): Promise<{ success: 'ok' | 'error'; err?: unknown }> => {
	const notIcp = invalidIcpAddress(destination);
	const notIcrc = invalidIcrcAddress(destination);

	if (notIcp && notIcrc) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.invalid_destination
		});
		return { success: 'error' };
	}

	if (isNullish(token)) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.empty_amount
		});
		return { success: 'error' };
	}

	try {
		assertNonNullish(missionControlId, get(i18n).errors.mission_control_not_loaded);

		const send = async () => {
			const fn = !invalidIcpAddress(destination) ? sendIcp : sendIcrc;

			await fn({
				destination,
				token,
				identity,
				missionControlId
			});
		};
		await execute({ fn: send, onProgress, step: SendTokensProgressStep.Send });

		const reload = async () => {
			await waitAndRestartWallet();
		};
		await execute({ fn: reload, onProgress, step: SendTokensProgressStep.Reload });
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.sending_error,
			detail: err
		});

		return { success: 'error', err };
	}

	return { success: 'ok' };
};

export const sendIcrc = async ({
	destination,
	token,
	...rest
}: {
	destination: string;
	token: TokenAmountV2;
	identity: OptionIdentity;
	missionControlId: MissionControlId;
}): Promise<void> => {
	const { owner, subaccount } = decodeIcrcAccount(destination);

	const args: MissionControlDid.TransferArg = {
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
	missionControlId: MissionControlId;
}): Promise<void> => {
	const args: MissionControlDid.TransferArgs = {
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
