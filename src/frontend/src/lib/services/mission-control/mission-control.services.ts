import type { MissionControlDid } from '$declarations';
import {
	getSettings,
	getUserData,
	setMetadata,
	setMissionControlController,
	setOrbiter,
	setSatellite,
	setSatellitesController,
	unsetOrbiter,
	unsetSatellite
} from '$lib/api/mission-control.api';
import {
	addMissionControlController003,
	addSatellitesController003,
	setMissionControlController004
} from '$lib/api/mission-control.deprecated.api';
import { METADATA_KEY_EMAIL } from '$lib/constants/metadata.constants';
import {
	MISSION_CONTROL_v0_0_14,
	MISSION_CONTROL_v0_0_3,
	MISSION_CONTROL_v0_0_5
} from '$lib/constants/version.constants';
import { loadDataStore } from '$lib/services/_loader.services';
import { loadSatellites } from '$lib/services/mission-control/mission-control.satellites.services';
import { mapSatellitesForControllersFn } from '$lib/services/satellite/satellite.controller.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { authStore } from '$lib/stores/auth.store';
import {
	missionControlSettingsUncertifiedStore,
	missionControlUserUncertifiedStore
} from '$lib/stores/mission-control/mission-control.store';
import { orbitersUncertifiedStore } from '$lib/stores/mission-control/orbiter.store';
import { versionStore } from '$lib/stores/version.store';
import type { SetControllerParams } from '$lib/types/controllers';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Metadata } from '$lib/types/metadata';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { isNotValidEmail } from '$lib/utils/email.utils';
import { container } from '$lib/utils/juno.utils';
import { fromNullable, isEmptyString, isNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { missionControlVersion } from '@junobuild/admin';
import { compare } from 'semver';
import { get } from 'svelte/store';

export const setMissionControlControllerForVersion = async ({
	missionControlId,
	controllerId,
	profile,
	identity
}: {
	missionControlId: MissionControlId;
	identity: Identity;
} & SetControllerParams) => {
	let version: string;
	try {
		version = await missionControlVersion({
			missionControl: { missionControlId: missionControlId.toText(), identity, ...container() }
		});
	} catch (_err: unknown) {
		// For simplicity, since this method is meant to support very old and likely inactive Mission Control instances,
		// we set the version to trigger the use of the latest API.
		version = MISSION_CONTROL_v0_0_5;
	}

	const missionControlController =
		compare(version, MISSION_CONTROL_v0_0_3) >= 0
			? compare(version, MISSION_CONTROL_v0_0_5) >= 0
				? setMissionControlController
				: setMissionControlController004
			: addMissionControlController003;

	await missionControlController({
		missionControlId,
		controllerId,
		profile,
		scope: 'admin',
		identity
	});
};

export const setSatellitesControllerForVersion = async ({
	missionControlId,
	satelliteIds,
	controllerId,
	profile,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteIds: Principal[];
	identity: Identity;
} & SetControllerParams) => {
	const { setSatelliteIds, addSatellitesIds } = await mapSatellitesForControllersFn({
		satelliteIds,
		identity
	});

	await Promise.all([
		...(setSatelliteIds.length > 0
			? [
					setSatellitesController({
						satelliteIds: setSatelliteIds,
						missionControlId,
						controllerId,
						profile,
						scope: 'admin',
						identity
					})
				]
			: []),
		...(addSatellitesIds.length > 0
			? [
					addSatellitesController003({
						satelliteIds: addSatellitesIds,
						missionControlId,
						controllerId,
						profile,
						scope: 'admin',
						identity
					})
				]
			: [])
	]);
};

export const attachSatellite = async ({
	missionControlId,
	satelliteId
}: {
	missionControlId: MissionControlId;
	satelliteId: Principal;
}) => {
	const { identity } = get(authStore);

	await setSatellite({ missionControlId, satelliteId, identity });

	// We reload all satellites because if the developer accesses the mission control page directly, the satellites may not be loaded. Adding just one satellite could give the user the impression that there is an issue.
	await loadSatellites({
		missionControlId,
		reload: true
	});
};

export const detachSatellite = async ({
	canisterId,
	missionControlId
}: {
	missionControlId: MissionControlId;
	canisterId: Principal;
}) => {
	const { identity } = get(authStore);

	await unsetSatellite({ missionControlId, satelliteId: canisterId, identity });

	await loadSatellites({
		missionControlId,
		reload: true
	});
};

export const attachOrbiter = async (params: {
	missionControlId: MissionControlId;
	orbiterId: Principal;
}) => {
	const { identity } = get(authStore);

	const orbiter = await setOrbiter({ ...params, identity });

	orbitersUncertifiedStore.set([orbiter]);
};

export const detachOrbiter = async ({
	canisterId,
	...rest
}: {
	missionControlId: MissionControlId;
	canisterId: Principal;
}) => {
	const { identity } = get(authStore);

	await unsetOrbiter({ ...rest, orbiterId: canisterId, identity });

	orbitersUncertifiedStore.reset();
};

export const loadSettings = async ({
	missionControlId,
	identity,
	reload = false
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
	reload?: boolean;
}): Promise<{ success: boolean }> => {
	const store = get(versionStore);

	if (compare(store.missionControl?.current ?? '0.0.0', MISSION_CONTROL_v0_0_14) < 0) {
		missionControlSettingsUncertifiedStore.reset();
		return { success: true };
	}

	const load = async (
		identity: Identity
	): Promise<MissionControlDid.MissionControlSettings | undefined> => {
		const settings = await getSettings({
			missionControlId,
			identity
		});

		return fromNullable(settings);
	};

	const { result } = await loadDataStore<MissionControlDid.MissionControlSettings | undefined>({
		identity,
		reload,
		load,
		errorLabel: 'load_settings',
		store: missionControlSettingsUncertifiedStore
	});

	return { success: result !== 'error' };
};

export const loadUserData = async ({
	missionControlId,
	identity,
	reload = false
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
	reload?: boolean;
}): Promise<{ success: boolean }> => {
	const store = get(versionStore);

	if (compare(store.missionControl?.current ?? '0.0.0', MISSION_CONTROL_v0_0_14) < 0) {
		missionControlUserUncertifiedStore.reset();
		return { success: true };
	}

	const load = async (identity: Identity): Promise<MissionControlDid.User> =>
		await getUserData({
			missionControlId,
			identity
		});

	const { result } = await loadDataStore<MissionControlDid.User>({
		identity,
		reload,
		load,
		errorLabel: 'load_user_data',
		store: missionControlUserUncertifiedStore
	});

	return { success: result !== 'error' };
};

export const setMetadataEmail = async ({
	missionControlId,
	identity,
	email,
	metadata
}: {
	missionControlId: Option<Principal>;
	identity: OptionIdentity;
	email: string;
	metadata: Metadata;
}): Promise<{ success: boolean }> => {
	if (isEmptyString(email) || isNotValidEmail(email)) {
		toasts.error({
			text: get(i18n).errors.invalid_email
		});
		return { success: false };
	}

	if (isNullish(missionControlId)) {
		toasts.error({
			text: get(i18n).errors.no_mission_control
		});
		return { success: false };
	}

	try {
		const updateData = new Map(metadata);
		updateData.set(METADATA_KEY_EMAIL, email);

		const data = Array.from(updateData);

		await setMetadata({
			identity,
			missionControlId,
			metadata: data
		});

		await loadUserData({
			identity,
			missionControlId,
			reload: true
		});

		return { success: true };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.monitoring_email_update,
			detail: err
		});

		return { success: false };
	}
};
