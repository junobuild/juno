import type { MissionControlDid } from '$declarations';
import { getMissionControlActor } from '$lib/api/actors/actor.juno.api';
import type { AccessKeyIdParam, AddAccessKeyParams } from '$lib/types/access-keys';
import type { NullishIdentity } from '$lib/types/itentity';
import type { Metadata } from '$lib/types/metadata';
import type { MissionControlId } from '$lib/types/mission-control';
import type { GetMonitoringParams, MonitoringHistory } from '$lib/types/monitoring';
import { toSetController } from '$lib/utils/controllers.utils';
import { toNullable } from '@dfinity/utils';
import { Principal } from '@icp-sdk/core/principal';

export const setSatellitesController = async ({
	identity,
	missionControlId,
	satelliteIds,
	accessKeyId,
	...rest
}: {
	missionControlId: MissionControlId;
	satelliteIds: Principal[];
	identity: NullishIdentity;
} & AddAccessKeyParams) => {
	try {
		const { set_satellites_controllers } = await getMissionControlActor({
			missionControlId,
			identity
		});

		await set_satellites_controllers(
			satelliteIds,
			[Principal.from(accessKeyId)],
			toSetController(rest)
		);
	} catch (err: unknown) {
		console.error(
			'setSatellitesController:',
			missionControlId.toText(),
			satelliteIds.map((id) => id.toText()).join(',')
		);
		throw err;
	}
};

export const deleteSatellitesController = async ({
	missionControlId,
	satelliteIds,
	accessKeyId,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteIds: Principal[];
	identity: NullishIdentity;
} & AccessKeyIdParam) => {
	const { del_satellites_controllers } = await getMissionControlActor({
		missionControlId,
		identity
	});
	await del_satellites_controllers(satelliteIds, [Principal.from(accessKeyId)]);
};

export const setMissionControlController = async ({
	identity,
	missionControlId,
	accessKeyId,
	...rest
}: {
	missionControlId: MissionControlId;
	identity: NullishIdentity;
} & AddAccessKeyParams) => {
	try {
		const { set_mission_control_controllers } = await getMissionControlActor({
			missionControlId,
			identity
		});

		await set_mission_control_controllers([Principal.from(accessKeyId)], toSetController(rest));
	} catch (err: unknown) {
		console.error('setMissionControlController:', missionControlId.toText());
		throw err;
	}
};

export const deleteMissionControlController = async ({
	missionControlId,
	identity,
	accessKeyId
}: {
	missionControlId: MissionControlId;
	identity: NullishIdentity;
} & AccessKeyIdParam) => {
	const { del_mission_control_controllers } = await getMissionControlActor({
		missionControlId,
		identity
	});
	await del_mission_control_controllers([Principal.from(accessKeyId)]);
};

export const listMissionControlControllers = async ({
	missionControlId,
	identity
}: {
	missionControlId: MissionControlId;
	identity: NullishIdentity;
}): Promise<[Principal, MissionControlDid.AccessKey][]> => {
	const { list_mission_control_controllers } = await getMissionControlActor({
		missionControlId,
		identity
	});
	return list_mission_control_controllers();
};

export const topUp = async ({
	missionControlId,
	canisterId,
	e8s,
	identity
}: {
	missionControlId: MissionControlId;
	canisterId: Principal;
	e8s: bigint;
	identity: NullishIdentity;
}) => {
	const { top_up } = await getMissionControlActor({ missionControlId, identity });
	await top_up(canisterId, { e8s });
};

export const setSatelliteMetadata = async ({
	missionControlId,
	satelliteId,
	metadata,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteId: Principal;
	metadata: Metadata;
	identity: NullishIdentity;
}): Promise<MissionControlDid.Satellite> => {
	const { set_satellite_metadata } = await getMissionControlActor({ missionControlId, identity });
	return set_satellite_metadata(satelliteId, metadata);
};

export const setOrbitersController = async ({
	missionControlId,
	orbiterIds,
	accessKeyId,
	identity,
	...rest
}: {
	missionControlId: MissionControlId;
	orbiterIds: Principal[];
	identity: NullishIdentity;
} & AddAccessKeyParams) => {
	try {
		const { set_orbiters_controllers } = await getMissionControlActor({
			missionControlId,
			identity
		});

		await set_orbiters_controllers(
			orbiterIds,
			[Principal.from(accessKeyId)],
			toSetController(rest)
		);
	} catch (err: unknown) {
		console.error(
			'setOrbitersController:',
			missionControlId.toText(),
			orbiterIds.map((id) => id.toText()).join(',')
		);
		throw err;
	}
};

export const deleteOrbitersController = async ({
	missionControlId,
	orbiterIds,
	accessKeyId,
	identity
}: {
	missionControlId: MissionControlId;
	orbiterIds: Principal[];
	identity: NullishIdentity;
} & AccessKeyIdParam) => {
	const { del_orbiters_controllers } = await getMissionControlActor({ missionControlId, identity });
	await del_orbiters_controllers(orbiterIds, [Principal.from(accessKeyId)]);
};

export const deleteSatellite = async ({
	missionControlId,
	satelliteId,
	cyclesToDeposit,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteId: Principal;
	cyclesToDeposit: bigint;
	identity: NullishIdentity;
}) => {
	const { del_satellite } = await getMissionControlActor({ missionControlId, identity });
	await del_satellite(satelliteId, cyclesToDeposit);
};

export const deleteOrbiter = async ({
	missionControlId,
	orbiterId,
	cyclesToDeposit,
	identity
}: {
	missionControlId: MissionControlId;
	orbiterId: Principal;
	cyclesToDeposit: bigint;
	identity: NullishIdentity;
}) => {
	const { del_orbiter } = await getMissionControlActor({ missionControlId, identity });
	await del_orbiter(orbiterId, cyclesToDeposit);
};

export const depositCycles = async ({
	missionControlId,
	cycles,
	destinationId: destination_id,
	identity
}: {
	missionControlId: MissionControlId;
	cycles: bigint;
	destinationId: Principal;
	identity: NullishIdentity;
}) => {
	const { deposit_cycles } = await getMissionControlActor({ missionControlId, identity });
	return deposit_cycles({
		cycles,
		destination_id
	});
};

export const setOrbiter = async ({
	missionControlId,
	orbiterId,
	orbiterName,
	identity
}: {
	missionControlId: MissionControlId;
	orbiterId: Principal;
	orbiterName?: string;
	identity: NullishIdentity;
}): Promise<MissionControlDid.Orbiter> => {
	const { set_orbiter } = await getMissionControlActor({ missionControlId, identity });
	return set_orbiter(orbiterId, toNullable(orbiterName));
};

export const unsetOrbiter = async ({
	missionControlId,
	orbiterId,
	identity
}: {
	missionControlId: MissionControlId;
	orbiterId: Principal;
	identity: NullishIdentity;
}): Promise<void> => {
	const { unset_orbiter } = await getMissionControlActor({ missionControlId, identity });
	return unset_orbiter(orbiterId);
};

export const setSatellite = async ({
	missionControlId,
	satelliteId,
	satelliteName,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteId: Principal;
	satelliteName?: string;
	identity: NullishIdentity;
}): Promise<MissionControlDid.Satellite> => {
	const { set_satellite } = await getMissionControlActor({ missionControlId, identity });
	return set_satellite(satelliteId, toNullable(satelliteName));
};

export const unsetSatellite = async ({
	missionControlId,
	satelliteId,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteId: Principal;
	identity: NullishIdentity;
}): Promise<void> => {
	const { unset_satellite } = await getMissionControlActor({ missionControlId, identity });
	return unset_satellite(satelliteId);
};

export const icpTransfer = async ({
	missionControlId,
	args,
	identity
}: {
	missionControlId: MissionControlId;
	args: MissionControlDid.TransferArgs;
	identity: NullishIdentity;
}): Promise<MissionControlDid.Result> => {
	const { icp_transfer } = await getMissionControlActor({ missionControlId, identity });
	return icp_transfer(args);
};

export const icrcTransfer = async ({
	ledgerId,
	missionControlId,
	args,
	identity
}: {
	ledgerId: Principal;
	missionControlId: MissionControlId;
	args: MissionControlDid.TransferArg;
	identity: NullishIdentity;
}): Promise<MissionControlDid.Result_1> => {
	const { icrc_transfer } = await getMissionControlActor({ missionControlId, identity });
	return icrc_transfer(ledgerId, args);
};

export const getUserData = async ({
	missionControlId,
	identity
}: {
	missionControlId: MissionControlId;
	identity: NullishIdentity;
}): Promise<MissionControlDid.User> => {
	const { get_user_data } = await getMissionControlActor({ missionControlId, identity });
	return get_user_data();
};

export const getSettings = async ({
	missionControlId,

	identity
}: {
	missionControlId: MissionControlId;
	identity: NullishIdentity;
}): Promise<[] | [MissionControlDid.MissionControlSettings]> => {
	const { get_settings } = await getMissionControlActor({ missionControlId, identity });
	return get_settings();
};

export const updateAndStartMonitoring = async ({
	missionControlId,
	identity,
	config
}: {
	missionControlId: MissionControlId;
	identity: NullishIdentity;
	config: MissionControlDid.MonitoringStartConfig;
}): Promise<void> => {
	const { update_and_start_monitoring } = await getMissionControlActor({
		missionControlId,
		identity
	});

	return await update_and_start_monitoring(config);
};

export const updateAndStopMonitoring = async ({
	missionControlId,
	identity,
	config
}: {
	missionControlId: MissionControlId;
	identity: NullishIdentity;
	config: MissionControlDid.MonitoringStopConfig;
}): Promise<void> => {
	const { update_and_stop_monitoring } = await getMissionControlActor({
		missionControlId,
		identity
	});

	return await update_and_stop_monitoring(config);
};

export const getMonitoringHistory = async ({
	missionControlId,
	identity,
	params: { from, to, segmentId }
}: {
	missionControlId: MissionControlId;
	identity: NullishIdentity;
	params: GetMonitoringParams;
}): Promise<MonitoringHistory> => {
	const { get_monitoring_history } = await getMissionControlActor({
		missionControlId,
		identity
	});

	return await get_monitoring_history({
		segment_id: segmentId,
		from: toNullable(from),
		to: toNullable(to)
	});
};

export const setConfig = async ({
	missionControlId,
	identity,
	config
}: {
	missionControlId: MissionControlId;
	identity: NullishIdentity;
	config: MissionControlDid.Config | undefined;
}): Promise<void> => {
	const { set_config } = await getMissionControlActor({
		missionControlId,
		identity
	});

	return await set_config(toNullable(config));
};

export const setMetadata = async ({
	missionControlId,
	metadata,
	identity
}: {
	missionControlId: MissionControlId;
	metadata: Metadata;
	identity: NullishIdentity;
}): Promise<void> => {
	const { set_metadata } = await getMissionControlActor({ missionControlId, identity });
	await set_metadata(metadata);
};
