import { E8S_PER_ICP } from '$lib/constants/constants';
import { formatNumber } from './number.utils';

export const formatICP = (icp: number): string =>
	formatNumber(icp, {
		minFraction: 4,
		maxFraction: 4
	});

export const formatE8sICP = (balance: bigint): string =>
	formatICP(Number(balance) / Number(E8S_PER_ICP));

export const formatE8sCredits = (balance: bigint): string =>
	formatNumber(Number(balance) / Number(E8S_PER_ICP), {
		minFraction: 2,
		maxFraction: 2
	});
