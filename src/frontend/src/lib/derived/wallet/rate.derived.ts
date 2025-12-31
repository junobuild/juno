import { icpToCyclesRateStore } from '$lib/stores/wallet/icp-cycles-rate.store';
import { derived } from 'svelte/store';

export const icpToCyclesRate = derived(
	[icpToCyclesRateStore],
	([$icpToCyclesRateStore]) => $icpToCyclesRateStore?.data
);
