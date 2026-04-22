import { setOrbiter, setSatellite } from '$lib/api/mission-control.api';
import { setControllers as setOrbiterControllers } from '$lib/api/orbiter.api';
import { setControllers as setSatelliteControllers } from '$lib/api/satellites.api';
import { consoleOrbiters, consoleSatellites } from '$lib/derived/console/segments.derived';
import {
	type SetAccessKeysFn,
	setAdminAccessKey
} from '$lib/services/access-keys/key.admin.services';
import { i18n } from '$lib/stores/app/i18n.store';
import type { AddAdminAccessKeyParams } from '$lib/types/access-keys';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Orbiter } from '$lib/types/orbiter';
import type { Satellite } from '$lib/types/satellite';
import { orbiterName } from '$lib/utils/orbiter.utils';
import { satelliteName } from '$lib/utils/satellite.utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

const CONTROLLER_PARAMS: Omit<AddAdminAccessKeyParams, 'accessKeyId'> = {};

export class AttachToMissionControlError extends Error {
	// eslint-disable-next-line local-rules/prefer-object-params
	static init(ids: Principal[], options?: ErrorOptions): AttachToMissionControlError {
		return new AttachToMissionControlError(
			`${get(i18n).mission_control.warn_attaching} ${ids.map((id) => id.toText()).join(',')}`,
			options
		);
	}
}

export const attachSatelliteToMissionControl = async ({
	satelliteId,
	missionControlId,
	identity,
	satelliteName
}: {
	satelliteId: Principal;
	missionControlId: MissionControlId;
	identity: Identity;
	satelliteName: string;
}) => {
	try {
		await setSatellite({
			missionControlId,
			satelliteId,
			identity,
			satelliteName
		});
	} catch (err: unknown) {
		throw AttachToMissionControlError.init([satelliteId], { cause: err });
	}
};

export const attachOrbiterToMissionControl = async ({
	orbiterId,
	missionControlId,
	identity
}: {
	orbiterId: Principal;
	missionControlId: MissionControlId;
	identity: Identity;
}) => {
	try {
		await setOrbiter({
			missionControlId,
			orbiterId,
			identity
		});
	} catch (err: unknown) {
		throw AttachToMissionControlError.init([orbiterId], { cause: err });
	}
};

export const attachSegmentsToMissionControl = async ({
	onTextProgress,
	missionControlId,
	identity
}: {
	onTextProgress: (text: string) => void;
	missionControlId: MissionControlId;
	identity: Identity;
}) => {
	const { satellites, orbiters } = await setMissionControlAsControllerAndAttach({
		onTextProgress,
		identity,
		missionControlId
	});

	const errors = [...satellites.errors, ...orbiters.errors];

	if (errors.length > 0) {
		throw AttachToMissionControlError.init(errors);
	}
};

interface SetMissionControlAsControllerProgressStats {
	index: number;
	total: number;
}

const setMissionControlAsControllerAndAttach = async ({
	onTextProgress,
	missionControlId,
	identity
}: {
	onTextProgress: (text: string) => void;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<{ satellites: AttachCanistersResult; orbiters: AttachCanistersResult }> => {
	const satellites = get(consoleSatellites) ?? [];
	const orbiters = get(consoleOrbiters) ?? [];

	let progress: SetMissionControlAsControllerProgressStats = {
		index: 0,
		total: satellites.length + orbiters.length
	};

	const incrementProgress = () => {
		progress = {
			...progress,
			index: progress.index + 1
		};

		onTextProgress(
			`${get(i18n).mission_control.attaching} (${progress.index} / ${progress.total})`
		);
	};

	const attachedSatellites = await attachSatellites({
		satellites,
		missionControlId,
		identity,
		incrementProgress
	});
	const attachedOrbiters = await attachOrbiters({
		orbiters,
		missionControlId,
		identity,
		incrementProgress
	});

	return {
		satellites: attachedSatellites,
		orbiters: attachedOrbiters
	};
};

interface AttachCanistersResult {
	errors: Principal[];
	successes: Principal[];
}

const attachSatellites = async ({
	satellites,
	incrementProgress,
	missionControlId,
	identity
}: {
	satellites: Satellite[];
	incrementProgress: () => void;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachCanistersResult> => {
	const canisterIds: AttachCanistersResult = { errors: [], successes: [] };

	for (const satellite of satellites) {
		incrementProgress();

		const result = await setMissionControlAsControllerAndAttachSatellite({
			satellite,
			missionControlId,
			identity
		});

		if (['ok', 'skip'].includes(result.result)) {
			canisterIds.successes.push(satellite.satellite_id);
		} else {
			canisterIds.errors.push(satellite.satellite_id);
		}
	}

	return canisterIds;
};

const attachOrbiters = async ({
	orbiters,
	incrementProgress,
	missionControlId,
	identity
}: {
	orbiters: Orbiter[];
	incrementProgress: () => void;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachCanistersResult> => {
	const canisterIds: AttachCanistersResult = { errors: [], successes: [] };

	for (const orbiter of orbiters) {
		incrementProgress();

		const result = await setMissionControlAsControllerAndAttachOrbiter({
			orbiter,
			missionControlId,
			identity
		});

		if (['ok', 'skip'].includes(result.result)) {
			canisterIds.successes.push(orbiter.orbiter_id);
		} else {
			canisterIds.errors.push(orbiter.orbiter_id);
		}
	}

	return canisterIds;
};

export const setMissionControlAsControllerAndAttachSatellite = async ({
	satellite,
	missionControlId,
	identity
}: {
	satellite: Satellite;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachSegmentResult> => {
	const { satellite_id: satelliteId } = satellite;

	const setControllersFn: SetAccessKeysFn = async ({ args }) => {
		await setSatelliteControllers({
			args,
			satelliteId,
			identity
		});
	};

	const attachFn = async () => {
		await setSatellite({
			missionControlId,
			satelliteId,
			identity,
			satelliteName: satelliteName(satellite)
		});
	};

	return await setAdminAccessKey({
		setAccessKeysFn: setControllersFn,
		attachFn,
		...CONTROLLER_PARAMS,
		canisterId: satelliteId,
		accessKeyId: missionControlId,
		identity
	});
};

export const setMissionControlAsControllerAndAttachOrbiter = async ({
	orbiter,
	missionControlId,
	identity
}: {
	orbiter: Orbiter;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachSegmentResult> => {
	const { orbiter_id: orbiterId } = orbiter;

	const setControllersFn: SetAccessKeysFn = async ({ args }) => {
		await setOrbiterControllers({
			args,
			orbiterId,
			identity
		});
	};

	const attachFn = async () => {
		await setOrbiter({ missionControlId, orbiterId, identity, orbiterName: orbiterName(orbiter) });
	};

	await setAdminAccessKey({
		setAccessKeysFn: setControllersFn,
		attachFn,
		...CONTROLLER_PARAMS,
		canisterId: orbiterId,
		accessKeyId: missionControlId,
		identity
	});

	return { result: 'ok' };
};

type AttachSegmentResult =
	| { result: 'ok' | 'skip' }
	| { result: 'reject'; reason: string }
	| { result: 'error'; err: unknown };
