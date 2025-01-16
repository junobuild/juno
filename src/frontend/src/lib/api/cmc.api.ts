import { getAgent } from '$lib/api/_agent/agent.api';
import { CMC_CANISTER_ID } from '$lib/constants/constants';
import { AnonymousIdentity } from '@dfinity/agent';
import { CMCCanister } from '@dfinity/cmc';
import { Principal } from '@dfinity/principal';

const NUMBER_XDR_PER_ONE_ICP = 10_000;

export const icpXdrConversionRate = async (): Promise<bigint> => {
	const agent = await getAgent({ identity: new AnonymousIdentity() });

	const { getIcpToCyclesConversionRate } = CMCCanister.create({
		agent,
		canisterId: Principal.fromText(CMC_CANISTER_ID)
	});

	const xdr_permyriad_per_icp = await getIcpToCyclesConversionRate();

	const CYCLES_PER_XDR = BigInt(1_000_000_000_000);

	// trillionRatio
	return (xdr_permyriad_per_icp * CYCLES_PER_XDR) / BigInt(NUMBER_XDR_PER_ONE_ICP);
};

export const getDefaultSubnets = async (): Promise<Principal[]> => {
	const agent = await getAgent({ identity: new AnonymousIdentity() });

	const { getDefaultSubnets: getDefaultSubnetsApi } = CMCCanister.create({
		agent,
		canisterId: Principal.fromText(CMC_CANISTER_ID)
	});

	return await getDefaultSubnetsApi({ certified: false });
};
