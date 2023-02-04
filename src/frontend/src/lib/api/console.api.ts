import type { ReleasesVersion } from '$declarations/console/console.did';
import { getConsoleActor } from '$lib/utils/actor.utils';

export const getCredits = async (): Promise<bigint> => {
	const actor = await getConsoleActor();
	const credits = await actor.get_credits();
	return credits.e8s;
};

export const releasesVersion = async (): Promise<ReleasesVersion> => {
	const actor = await getConsoleActor();
	return actor.get_releases_version();
};
