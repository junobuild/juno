import { E8S_PER_ICP } from '$lib/constants/constants';
import { formatNumber, formatUsd } from './number.utils';

export const formatICP = (icp: number): string =>
	formatNumber(icp, {
		minFraction: 4,
		maxFraction: 4
	});

export const formatE8sICP = (icp: bigint): string => formatICP(Number(icp) / Number(E8S_PER_ICP));

export const formatE8sICPToUsd = ({ icp, icpToUsd }: { icp: bigint; icpToUsd: number }): string =>
	formatUsd((Number(icp) * icpToUsd) / Number(E8S_PER_ICP));

export const formatE8sCredits = (icp: bigint): string =>
	formatNumber(Number(icp) / Number(E8S_PER_ICP), {
		minFraction: 2,
		maxFraction: 2
	});
