import { getAgent } from '$lib/api/_agent/_agent.api';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertNonNullish } from '@dfinity/utils';
import {
	IcpLedgerCanister,
	type BlockHeight,
	type Icrc1TransferRequest,
	type TransferRequest
} from '@icp-sdk/canisters/ledger/icp';

export const icpTransfer = async ({
	identity,
	request
}: {
	identity: OptionIdentity;
	request: TransferRequest;
}): Promise<BlockHeight> => {
	const { transfer } = await ipcLedgerCanister({ identity });
	return await transfer(request);
};

export const icrcTransfer = async ({
	identity,
	request
}: {
	identity: OptionIdentity;
	request: Icrc1TransferRequest;
}): Promise<BlockHeight> => {
	const { icrc1Transfer } = await ipcLedgerCanister({ identity });
	return await icrc1Transfer(request);
};

const ipcLedgerCanister = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<IcpLedgerCanister> => {
	assertNonNullish(identity, 'No internet identity to initialize the Ledger actor.');

	const agent = await getAgent({ identity });

	return IcpLedgerCanister.create({
		agent
	});
};
