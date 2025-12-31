import type { MissionControlDid } from '$declarations';
import {
	icpTransfer as icpTransferWithDev,
	icrcTransfer as icpTransferWithIcpAndDev
} from '$lib/api/icp-ledger.api';
import { icrcTransfer as icrcTransferWithDev } from '$lib/api/icrc-ledger.api';
import {
	icpTransfer as icpTransferWithMissionControl,
	icrcTransfer as icrcTransferWithMissionControl
} from '$lib/api/mission-control.api';
import { ICP_LEDGER_CANISTER_ID } from '$lib/constants/app.constants';
import { CYCLES, ICP_TRANSACTION_FEE } from '$lib/constants/token.constants';
import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
import { execute } from '$lib/services/_progress.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import { type SendTokensProgress, SendTokensProgressStep } from '$lib/types/progress-send-tokens';
import { nowInBigIntNanoSeconds } from '$lib/utils/date.utils';
import { invalidIcpAddress } from '$lib/utils/icp-account.utils';
import { invalidIcrcAddress } from '$lib/utils/icrc-account.utils';
import { isTokenCycles, isTokenIcp } from '$lib/utils/token.utils';
import { waitAndRestartWallet } from '$lib/utils/wallet.utils';
import { isNullish, type TokenAmountV2, toNullable } from '@dfinity/utils';
import {
	AccountIdentifier,
	type Icrc1TransferRequest,
	type TransferRequest
} from '@icp-sdk/canisters/ledger/icp';
import { decodeIcrcAccount, type TransferParams } from '@icp-sdk/canisters/ledger/icrc';
import { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

interface SendTokensParams {
	destination: string;
	token: TokenAmountV2 | undefined;
	identity: OptionIdentity;
	selectedWallet: SelectedWallet;
	selectedToken: SelectedToken;
	onProgress: (progress: SendTokensProgress | undefined) => void;
}

export const sendTokens = async ({
	destination,
	token,
	identity,
	selectedWallet,
	selectedToken,
	onProgress
}: SendTokensParams): Promise<{ success: 'ok' | 'error'; err?: unknown }> => {
	const notIcp = invalidIcpAddress(destination);
	const notIcrc = invalidIcrcAddress(destination);

	if (
		(isTokenIcp(selectedToken) && notIcp && notIcrc) ||
		(isTokenCycles(selectedToken) && notIcrc)
	) {
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
		const send = async () => {
			const params = {
				token,
				identity,
				destination,
				selectedWallet
			};

			const fn = isTokenIcp(selectedToken) ? buildSendIcp(params) : buildSendCycles(params);
			await fn();
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

const buildSendCycles = ({
	selectedWallet,
	destination,
	token,
	identity
}: Pick<SendTokensParams, 'selectedWallet' | 'destination' | 'identity'> & {
	token: TokenAmountV2;
}): (() => Promise<void>) => {
	const sendWithDev = async () => {
		if (selectedWallet.type === 'mission_control') {
			const labels = get(i18n);
			throw new Error(labels.errors.cycles_transfer_not_supported);
		}

		await sendCyclesWithDev({
			destination,
			token,
			identity
		});
	};

	return sendWithDev;
};

const buildSendIcp = ({
	selectedWallet,
	destination,
	token,
	identity
}: Pick<SendTokensParams, 'selectedWallet' | 'destination' | 'identity'> & {
	token: TokenAmountV2;
}): (() => Promise<void>) => {
	const { type: walletType, walletId } = selectedWallet;

	const sendWithMissionControl = async () => {
		const fn = !invalidIcpAddress(destination)
			? sendIcpWithMissionControl
			: sendIcrcWithMissionControl;

		// We do not use subaccount
		const { owner: missionControlId } = walletId;

		await fn({
			destination,
			token,
			identity,
			missionControlId
		});
	};

	const sendWithDev = async () => {
		const fn = !invalidIcpAddress(destination) ? sendIcpWithDev : sendIcpWithIcrcAndDev;

		await fn({
			destination,
			token,
			identity
		});
	};

	return walletType === 'mission_control' ? sendWithMissionControl : sendWithDev;
};

const sendIcrcWithMissionControl = async ({
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
		fee: toNullable(ICP_TRANSACTION_FEE),
		memo: toNullable(),
		from_subaccount: toNullable(),
		created_at_time: toNullable(nowInBigIntNanoSeconds())
	};

	await icrcTransferWithMissionControl({
		args,
		ledgerId: Principal.fromText(ICP_LEDGER_CANISTER_ID),
		...rest
	});
};

const sendIcpWithMissionControl = async ({
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
		fee: { e8s: ICP_TRANSACTION_FEE },
		memo: 0n,
		created_at_time: toNullable({ timestamp_nanos: nowInBigIntNanoSeconds() }),
		from_subaccount: toNullable()
	};

	await icpTransferWithMissionControl({
		args,
		...rest
	});
};

const sendIcpWithIcrcAndDev = async ({
	destination,
	token,
	...rest
}: {
	destination: string;
	token: TokenAmountV2;
	identity: OptionIdentity;
}): Promise<void> => {
	const { owner, subaccount } = decodeIcrcAccount(destination);

	const request: Icrc1TransferRequest = {
		to: {
			owner,
			subaccount: toNullable(subaccount)
		},
		amount: token.toE8s(),
		fee: ICP_TRANSACTION_FEE,
		createdAt: nowInBigIntNanoSeconds()
	};

	await icpTransferWithIcpAndDev({
		request,
		...rest
	});
};

const sendIcpWithDev = async ({
	destination,
	token,
	...rest
}: {
	destination: string;
	token: TokenAmountV2;
	identity: OptionIdentity;
}): Promise<void> => {
	const request: TransferRequest = {
		to: AccountIdentifier.fromHex(destination),
		amount: token.toE8s(),
		fee: ICP_TRANSACTION_FEE,
		createdAt: nowInBigIntNanoSeconds()
	};

	await icpTransferWithDev({
		request,
		...rest
	});
};

const sendCyclesWithDev = async ({
	destination,
	token,
	...rest
}: {
	destination: string;
	token: TokenAmountV2;
	identity: OptionIdentity;
}): Promise<void> => {
	const { owner, subaccount } = decodeIcrcAccount(destination);

	const request: TransferParams = {
		to: {
			owner,
			subaccount: toNullable(subaccount)
		},
		amount: token.toUlps(),
		fee: CYCLES.fee,
		created_at_time: nowInBigIntNanoSeconds()
	};

	await icrcTransferWithDev({
		ledgerId: Principal.fromText(CYCLES.ledgerId),
		request,
		...rest
	});
};
