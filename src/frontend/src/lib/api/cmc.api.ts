import { getAgent } from '$lib/api/_agent/_agent.api';
import { CMC_CANISTER_ID } from '$lib/constants/app.constants';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertNonNullish } from '@dfinity/utils';
import { type CmcDid, CmcCanister } from '@icp-sdk/canisters/cmc';
import type { BlockHeight } from '@icp-sdk/canisters/ledger/icp';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';

export const getIcpToCyclesConversionRate = async (): Promise<bigint> => {
	const { getIcpToCyclesConversionRate } = await cmcCanister({ identity: new AnonymousIdentity() });

	const xdrPermyriadPerIcp = await getIcpToCyclesConversionRate();

	const CYCLES_PER_XDR = 1_000_000_000_000n;

	const NUMBER_XDR_PER_ONE_ICP = 10_000n;

	// trillionRatio
	return (xdrPermyriadPerIcp * CYCLES_PER_XDR) / NUMBER_XDR_PER_ONE_ICP;
};

export const getDefaultSubnets = async (): Promise<Principal[]> => {
	const { getDefaultSubnets: getDefaultSubnetsApi } = await cmcCanister({
		identity: new AnonymousIdentity()
	});
	return await getDefaultSubnetsApi({ certified: false });
};

export const notifyTopUp = async ({
	identity,
	request
}: {
	identity: OptionIdentity;
	request: CmcDid.NotifyTopUpArg;
}): Promise<BlockHeight> => {
	const { notifyTopUp } = await cmcCanister({ identity });
	return await notifyTopUp(request);
};

export const notifyMintCycles = async ({
	identity,
	request
}: {
	identity: OptionIdentity;
	request: CmcDid.NotifyMintCyclesArg;
}): Promise<CmcDid.NotifyMintCyclesSuccess> => {
	const { notifyMintCycles } = await cmcCanister({ identity });
	return await notifyMintCycles(request);
};

const cmcCanister = async ({ identity }: { identity: OptionIdentity }): Promise<CmcCanister> => {
	assertNonNullish(identity, 'No internet identity to initialize the Cmc actor.');

	const agent = await getAgent({ identity });

	const CMC_ID = Principal.fromText(CMC_CANISTER_ID);

	return CmcCanister.create({
		agent,
		canisterId: CMC_ID
	});
};
