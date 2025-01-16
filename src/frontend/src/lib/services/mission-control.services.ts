import type {
	MissionControlSettings,
	Satellite,
	User
} from '$declarations/mission_control/mission_control.did';
import {
	addMissionControlController,
	addSatellitesController,
	getSettings,
	getUserData,
	missionControlVersion,
	setMetadata,
	setMissionControlController,
	setOrbiter,
	setSatellite,
	setSatelliteMetadata,
	setSatellitesController,
	unsetOrbiter,
	unsetSatellite
} from '$lib/api/mission-control.api';
import { setMissionControlController004 } from '$lib/api/mission-control.deprecated.api';
import { satelliteVersion } from '$lib/api/satellites.api';
import { METADATA_KEY_EMAIL, METADATA_KEY_NAME } from '$lib/constants/metadata.constants';
import {
	MISSION_CONTROL_v0_0_14,
	MISSION_CONTROL_v0_0_3,
	MISSION_CONTROL_v0_0_5,
	MISSION_CONTROL_v0_0_7
} from '$lib/constants/version.constants';
import { satellitesStore } from '$lib/derived/satellite.derived';
import { missionControlVersion as missionControlVersionStore } from '$lib/derived/version.derived';
import { loadDataStore } from '$lib/services/loader.services';
import { loadSatellites } from '$lib/services/satellites.services';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import {
	missionControlSettingsUncertifiedStore,
	missionControlUserUncertifiedStore
} from '$lib/stores/mission-control.store';
import { orbitersUncertifiedStore } from '$lib/stores/orbiter.store';
import { satellitesUncertifiedStore } from '$lib/stores/satellite.store';
import { toasts } from '$lib/stores/toasts.store';
import type { SetControllerParams } from '$lib/types/controllers';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Metadata } from '$lib/types/metadata';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { isNotValidEmail } from '$lib/utils/email.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { fromNullable, isEmptyString, isNullish } from '@dfinity/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

// TODO: to be removed in next version as only supported if < v0.0.3
export const setMissionControlControllerForVersion = async ({
	missionControlId,
	controllerId,
	profile
}: {
	missionControlId: MissionControlId;
} & SetControllerParams) => {
	const identity = get(authStore).identity;

	const version = await missionControlVersion({ missionControlId, identity });

	const missionControlController =
		compare(version, MISSION_CONTROL_v0_0_3) >= 0
			? compare(version, MISSION_CONTROL_v0_0_5) >= 0
				? setMissionControlController
				: setMissionControlController004
			: addMissionControlController;

	await missionControlController({
		missionControlId,
		controllerId,
		profile,
		scope: 'admin',
		identity
	});
};

// TODO: to be removed in next version as only supported if < v0.0.7
export const setSatellitesForVersion = async ({
	missionControlId,
	satelliteIds,
	controllerId,
	profile
}: {
	missionControlId: MissionControlId;
	satelliteIds: Principal[];
} & SetControllerParams) => {
	const identity = get(authStore).identity;

	const mapVersions = async (
		satelliteId: Principal
	): Promise<{ satelliteId: Principal; version: string }> => {
		const version = await satelliteVersion({ satelliteId, identity });
		return {
			version,
			satelliteId
		};
	};

	const versions = await Promise.all(satelliteIds.map(mapVersions));

	const { setSatelliteIds, addSatellitesIds } = versions.reduce(
		(
			{
				setSatelliteIds,
				addSatellitesIds
			}: { setSatelliteIds: Principal[]; addSatellitesIds: Principal[] },
			{ satelliteId, version }
		) => {
			if (compare(version, MISSION_CONTROL_v0_0_7) >= 0) {
				return {
					setSatelliteIds: [...setSatelliteIds, satelliteId],
					addSatellitesIds
				};
			}

			return {
				setSatelliteIds,
				addSatellitesIds: [...addSatellitesIds, satelliteId]
			};
		},
		{ setSatelliteIds: [], addSatellitesIds: [] }
	);

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
					addSatellitesController({
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

export const setSatelliteName = async ({
	missionControlId,
	satellite: { satellite_id: satelliteId, metadata },
	satelliteName
}: {
	missionControlId: MissionControlId;
	satellite: Satellite;
	satelliteName: string;
}) => {
	const updateData = new Map(metadata);
	updateData.set(METADATA_KEY_NAME, satelliteName);

	const identity = get(authStore).identity;

	const updatedSatellite = await setSatelliteMetadata({
		missionControlId,
		satelliteId,
		metadata: Array.from(updateData),
		identity
	});

	const satellites = get(satellitesStore);
	satellitesUncertifiedStore.set([
		...(satellites ?? []).filter(
			({ satellite_id }) => updatedSatellite.satellite_id.toText() !== satellite_id.toText()
		),
		updatedSatellite
	]);
};

export const attachSatellite = async ({
	missionControlId,
	satelliteId
}: {
	missionControlId: MissionControlId;
	satelliteId: Principal;
}) => {
	const identity = get(authStore).identity;

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
	const identity = get(authStore).identity;

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
	const identity = get(authStore).identity;

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
	const identity = get(authStore).identity;

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
	const versionStore = get(missionControlVersionStore);

	if (compare(versionStore?.current ?? '0.0.0', MISSION_CONTROL_v0_0_14) < 0) {
		missionControlSettingsUncertifiedStore.reset();
		return { success: true };
	}

	const load = async (identity: Identity): Promise<MissionControlSettings | undefined> => {
		const settings = await getSettings({
			missionControlId,
			identity
		});

		return fromNullable(settings);
	};

	const { result } = await loadDataStore<MissionControlSettings | undefined>({
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
	const versionStore = get(missionControlVersionStore);

	if (compare(versionStore?.current ?? '0.0.0', MISSION_CONTROL_v0_0_14) < 0) {
		missionControlUserUncertifiedStore.reset();
		return { success: true };
	}

	const load = async (identity: Identity): Promise<User> =>
		await getUserData({
			missionControlId,
			identity
		});

	const { result } = await loadDataStore<User>({
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
