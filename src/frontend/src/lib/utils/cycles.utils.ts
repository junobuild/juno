import { formatNumber } from './number.utils';

const ONE_TRILLION = 1_000_000_000_000;

export const formatTCycles = (cycles: bigint): string =>
	formatNumber(Number(cycles) / Number(ONE_TRILLION), {
		minFraction: 3,
		maxFraction: 3
	});

export const cyclesToICP = ({
	cycles,
	trillionRatio
}: {
	cycles: bigint;
	trillionRatio: bigint;
}): number => Number(cycles) / Number(trillionRatio);

export const icpToCycles = ({
	icp,
	trillionRatio
}: {
	icp: number;
	trillionRatio: bigint;
}): number => Math.trunc(icp * Number(trillionRatio));
