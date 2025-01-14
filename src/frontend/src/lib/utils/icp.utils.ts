import { E8S_PER_ICP } from '$lib/constants/constants';
import { formatNumber, formatUsd } from './number.utils';

/**
 * Formats an ICP value (in e8s) to a human-readable string with 4 decimal places.
 *
 * @param {bigint} icp - The value of ICP in e8s (1 ICP = 10^8 e8s).
 * @returns {string} - The formatted ICP value as a string with 4 decimal places.
 */
export const formatICP = (icp: bigint): string =>
	formatNumber(Number(icp) / Number(E8S_PER_ICP), {
		minFraction: 4,
		maxFraction: 4
	});

/**
 * Converts an ICP value (in e8s) to USD using a given exchange rate and formats it as a USD string.
 *
 * @param {Object} params - The parameters for conversion.
 * @param {bigint} params.icp - The value of ICP in e8s (1 ICP = 10^8 e8s).
 * @param {number} params.icpToUsd - The exchange rate of 1 ICP to USD.
 * @returns {string} - The formatted USD value as a string.
 */
export const formatICPToUsd = ({ icp, icpToUsd }: { icp: bigint; icpToUsd: number }): string =>
	formatUsd((Number(icp) * icpToUsd) / Number(E8S_PER_ICP));

/**
 * Formats a credits value (in e8s) to a human-readable string with 2 decimal places.
 *
 * @param {bigint} credits - The value of credits in e8s (1 credit = 10^8 e8s).
 * @returns {string} - The formatted credits value as a string with 2 decimal places.
 */
export const formatCredits = (credits: bigint): string =>
	formatNumber(Number(credits) / Number(E8S_PER_ICP), {
		minFraction: 2,
		maxFraction: 2
	});
