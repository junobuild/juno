import { CMC_CANISTER_ID } from '$lib/constants/constants';
import { getAgent } from '$lib/utils/agent.utils';
import { AnonymousIdentity } from '@dfinity/agent';
import { CMCCanister } from '@dfinity/cmc';

const NUMBER_XDR_PER_ONE_ICP = 10_000;

export const icpXdrConversionRate = async (): Promise<bigint> => {
	const agent = await getAgent({ identity: new AnonymousIdentity() });

	const { getIcpToCyclesConversionRate } = CMCCanister.create({
		agent,
		canisterId: CMC_CANISTER_ID
	});

	const xdr_permyriad_per_icp = await getIcpToCyclesConversionRate();

	const CYCLES_PER_XDR = BigInt(1_000_000_000_000);

	// trillionRatio
	return (xdr_permyriad_per_icp * CYCLES_PER_XDR) / BigInt(NUMBER_XDR_PER_ONE_ICP);
};
