import { setOrbiter, setSatellite } from '$lib/api/mission-control.api';
import { setControllers as setOrbiterControllers } from '$lib/api/orbiter.api';
import { setControllers as setSatelliteControllers } from '$lib/api/satellites.api';
import { consoleOrbiters, consoleSatellites } from '$lib/derived/console/segments.derived';
import {
	type SetControllersFn,
	setControllerWithIcMgmt
} from '$lib/services/_controllers.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { SetControllerParams } from '$lib/types/controllers';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Orbiter } from '$lib/types/orbiter';
import { type WizardCreateProgress, WizardCreateProgressStep } from '$lib/types/progress-wizard';
import type { Satellite } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { orbiterName } from '$lib/utils/orbiter.utils';
import { satelliteName } from '$lib/utils/satellite.utils';
import { waitForMilliseconds } from '$lib/utils/timeout.utils';
import { assertNonNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

type FinalizeMissionControlWizardResult = Promise<{ success: 'ok' } | { success: 'warning' }>;

const CONTROLLER_PARAMS: Omit<SetControllerParams, 'controllerId'> = {
	profile: undefined,
	scope: 'admin'
};

export const finalizeMissionControlWizard = async ({
	onProgress,
	onTextProgress,
	missionControlId,
	identity
}: {
	onProgress: (progress: WizardCreateProgress | undefined) => void;
	onTextProgress: (text: string) => void;
	missionControlId: MissionControlId;
	identity: Option<Identity>;
}): Promise<FinalizeMissionControlWizardResult> => {
	assertNonNullish(identity, get(i18n).core.not_logged_in);

	onProgress({
		step: WizardCreateProgressStep.Attaching,
		state: 'in_progress'
	});

	const { satellites, orbiters } = await setMissionControlAsControllerAndAttach({
		onTextProgress,
		identity,
		missionControlId
	});

	const errors = [...satellites.errors, ...orbiters.errors];

	const withErrors = errors.length > 0;

	if (withErrors) {
		toasts.error({
			text: `${get(i18n).mission_control.warn_attaching} ${errors.map((id) => id.toText()).join(',')}`,
			level: 'warn'
		});
	}

	onProgress({
		step: WizardCreateProgressStep.Attaching,
		state: withErrors ? 'warning' : 'success'
	});

	return { success: withErrors ? 'warning' : 'ok' };
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

		const result = await attachSatellite({
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

		const result = await attachOrbiter({
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

const attachSatellite = async ({
	satellite,
	missionControlId,
	identity
}: {
	satellite: Satellite;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachSegmentResult> => {
	const { satellite_id: satelliteId } = satellite;

	const setControllersFn: SetControllersFn = async ({ args }) => {
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

	return await setControllerWithIcMgmt({
		setControllersFn,
		attachFn,
		...CONTROLLER_PARAMS,
		canisterId: satelliteId,
		controllerId: missionControlId,
		identity
	});
};

const attachOrbiter = async ({
	orbiter,
	missionControlId,
	identity
}: {
	orbiter: Orbiter;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachSegmentResult> => {
	const { orbiter_id: orbiterId } = orbiter;

	const setControllersFn: SetControllersFn = async ({ args }) => {
		await setOrbiterControllers({
			args,
			orbiterId,
			identity
		});
	};

	const attachFn = async () => {
		await setOrbiter({ missionControlId, orbiterId, identity, orbiterName: orbiterName(orbiter) });
	};

	await setControllerWithIcMgmt({
		setControllersFn,
		attachFn,
		...CONTROLLER_PARAMS,
		canisterId: orbiterId,
		controllerId: missionControlId,
		identity
	});

	return { result: 'ok' };
};

type AttachSegmentResult =
	| { result: 'ok' | 'skip' }
	| { result: 'reject'; reason: string }
	| { result: 'error'; err: unknown };
