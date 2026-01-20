import { E8S_PER_ICP, ONE_TRILLION } from '$lib/constants/app.constants';
import { notEmptyString } from '@dfinity/utils';
import { formatNumber } from './number.utils';

export const formatTCycles = (cycles: bigint): string =>
	formatNumber(Number(cycles) / Number(ONE_TRILLION), {
		minFraction: 3,
		maxFraction: 4
	});

export const tCyclesToCycles = (tCycles: string): bigint =>
	BigInt(parseFloat(notEmptyString(tCycles) ? tCycles : '0') * ONE_TRILLION);

export const cyclesToIcpE8s = ({
	cycles,
	trillionRatio
}: {
	cycles: bigint;
	trillionRatio: bigint;
}): bigint => (cycles * E8S_PER_ICP) / trillionRatio;

export const icpE8sToCycles = ({
	icpE8s,
	trillionRatio
}: {
	icpE8s: bigint;
	trillionRatio: bigint;
}): bigint => (icpE8s * trillionRatio) / E8S_PER_ICP;

export const icpToCycles = ({
	icp,
	trillionRatio
}: {
	icp: bigint;
	trillionRatio: bigint;
}): bigint => icp * trillionRatio;

export const icpNumberToCycles = ({
	icp,
	trillionRatio
}: {
	icp: number;
	trillionRatio: bigint;
}): bigint => BigInt(Math.trunc(icp * Number(trillionRatio)));

export const formatCyclesToHTML = ({ e12s, bold }: { e12s: bigint; bold: boolean }): string => {
	const tag = bold ? 'strong' : 'span';
	return `<${tag}>${formatTCycles(e12s)} <small>TCycles</small></${tag}>`;
};
