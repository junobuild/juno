import { setSatellitesController } from '$lib/api/mission-control.api';
import { SKYLAB } from '$lib/constants/app.constants';
import { getEmulatorMainIdentity } from '$lib/rest/emulator.rest';
import { i18n } from '$lib/stores/i18n.store';
import type { SetControllerParams } from '$lib/types/controllers';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

/**
 * In the Skylab emulator environment, where developers use a version of the Console UI deployed within the container,
 * we need a way to grant the inner CLI (running inside the Docker container) access to the Satellites.
 * Without this, we can't offer live reload capabilities — which, in my opinion, is really important during development.
 *
 * To prevent any abuse, these functions are guarded by the SKYLAB flag, and the URL is blocked by the CSP in production.
 */
export const unsafeSetEmulatorControllerForSatellite = async ({
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

	await unsafeSetEmulatorController({
		missionControlId,
		addController: add
	});
};

const unsafeSetEmulatorController = async ({
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
		throw new Error(get(i18n).emulator.error_never_execute);
	}

	const mainIdentity = await getEmulatorMainIdentity();

	await addController({
		controllerId: mainIdentity,
		missionControlId,
		profile: `👾 ${get(i18n).emulator.emulator}`,
		scope: 'admin'
	});
};
