import type { ReleasesVersion } from '$declarations/console/console.did';
import { getConsoleActor } from '$lib/utils/actor.utils';
import { fromNullable } from '$lib/utils/did.utils';
import { isNullish } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';

export const getCredits = async (): Promise<bigint> => {
	const actor = await getConsoleActor();
	const credits = await actor.get_credits();
	return credits.e8s;
};

export const getSatelliteFee = async (user: Principal): Promise<bigint> => {
	const actor = await getConsoleActor();
	const result = await actor.get_create_satellite_fee({ user });
	const fee = fromNullable(result);

	// If user has enough credits, it returns no fee
	return isNullish(fee) ? 0n : fee.e8s;
};

export const getOrbiterFee = async (user: Principal): Promise<bigint> => {
	const actor = await getConsoleActor();
	const result = await actor.get_create_orbiter_fee({ user });
	const fee = fromNullable(result);

	// If user has enough credits, it returns no fee
	return isNullish(fee) ? 0n : fee.e8s;
};

export const releasesVersion = async (): Promise<ReleasesVersion> => {
	const actor = await getConsoleActor();
	return actor.get_releases_version();
};
