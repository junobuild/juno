import { ONE_TRILLION } from '$lib/constants/app.constants';
import { notEmptyString } from '@dfinity/utils';
import { formatNumber } from './number.utils';

export const formatTCycles = (cycles: bigint): string =>
	formatNumber(Number(cycles) / Number(ONE_TRILLION), {
		minFraction: 3,
		maxFraction: 3
	});

export const tCyclesToCycles = (tCycles: string): bigint =>
	BigInt(parseFloat(notEmptyString(tCycles) ? tCycles : '0') * ONE_TRILLION);

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
