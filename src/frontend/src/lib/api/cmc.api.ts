import type { _SERVICE as CMCActor } from '$declarations/cmc/cmc.did';
import { getCMCActor } from '$lib/utils/actor.ic.utils';

const NUMBER_XDR_PER_ONE_ICP = 10_000;

export const icpXdrConversionRate = async (): Promise<bigint> => {
	const actor: CMCActor = await getCMCActor();

	const { data } = await actor.get_icp_xdr_conversion_rate();
	const { xdr_permyriad_per_icp } = data;

	const CYCLES_PER_XDR = BigInt(1_000_000_000_000);

	// trillionRatio
	return (xdr_permyriad_per_icp * CYCLES_PER_XDR) / BigInt(NUMBER_XDR_PER_ONE_ICP);
};
