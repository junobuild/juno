import { missionControlIdNotLoaded } from '$lib/derived/console/account.mission-control.derived';
import { satellitesNotLoaded } from '$lib/derived/mission-control/satellites.derived';
import { orbiterNotLoaded } from '$lib/derived/orbiter.derived';
import {
	missionControlVersion,
	orbiterVersion,
	satellitesVersion
} from '$lib/derived/version.derived';
import { derived, type Readable } from 'svelte/store';

export const hasPendingUpgrades: Readable<boolean | undefined> = derived(
	[
		missionControlIdNotLoaded,
		satellitesNotLoaded,
		orbiterNotLoaded,
		missionControlVersion,
		orbiterVersion,
		satellitesVersion
	],
	([
		$missionControlIdNotLoaded,
		$satellitesNotLoaded,
		$orbiterNotLoaded,
		$missionControlVersion,
		$orbiterVersion,
		$satellitesVersion
	]) => {
		if ($missionControlIdNotLoaded || $satellitesNotLoaded || $orbiterNotLoaded) {
			return undefined;
		}

		return (
			$missionControlVersion?.warning === true ||
			$orbiterVersion?.warning === true ||
			Object.values($satellitesVersion).find((value) => value?.warning === true) !== undefined
		);
	}
);
