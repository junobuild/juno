import { setSatellitesController } from '$lib/api/mission-control.api';
import { SKYLAB } from '$lib/constants/app.constants';
import { getSkylabMainIdentity } from '$lib/rest/skylab.rest';
import type { SetControllerParams } from '$lib/types/controllers';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

/**
 * In the Skylab emulator environment, where developers use a version of the Console UI deployed within the container,
 * we need a way to grant the inner CLI (running inside the Docker container) access to the Satellites.
 * Without this, we can't offer live reload capabilities — which, in my opinion, is really important during development.
 *
 * To prevent any abuse, these functions are guarded by the SKYLAB flag, and the URL is blocked by the CSP in production.
 */
export const unsafeSetSkylabControllerForSatellite = async ({
	missionControlId,
	satelliteId,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteId: Principal;
	identity: Identity;
}) => {
	const add = (
		params: {
			missionControlId: MissionControlId;
		} & SetControllerParams
	): Promise<void> =>
		setSatellitesController({
			...params,
			satelliteIds: [satelliteId],
			identity
		});

	await unsafeSetSkylabController({
		missionControlId,
		addController: add
	});
};

const unsafeSetSkylabController = async ({
	missionControlId,
	addController
}: {
	missionControlId: MissionControlId;
	addController: (
		params: {
			missionControlId: MissionControlId;
		} & SetControllerParams
	) => Promise<void>;
}) => {
	if (!SKYLAB) {
		throw new Error(
			'⚠️ This function should never ever be executed outside the emulator environment. Setting a controller at this step is strictly for the emulator (and yes, it would fail anyway).'
		);
	}

	const mainIdentity = await getSkylabMainIdentity();

	await addController({
		controllerId: mainIdentity,
		missionControlId,
		profile: '⚠️ Emulator',
		scope: 'admin'
	});
};
