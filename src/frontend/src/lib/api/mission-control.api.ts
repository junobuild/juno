import { getMissionControlActor } from '$lib/api/actors/actor.juno.api';
import type { SetControllerParams } from '$lib/types/controllers';
import type { MissionControlDid } from '$lib/types/declarations';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Metadata } from '$lib/types/metadata';
import type { MissionControlId } from '$lib/types/mission-control';
import type { GetMonitoringParams, MonitoringHistory } from '$lib/types/monitoring';
import { toSetController } from '$lib/utils/controllers.utils';
import { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';

export const setSatellitesController = async ({
	identity,
	missionControlId,
	satelliteIds,
	controllerId,
	...rest
}: {
	missionControlId: MissionControlId;
	satelliteIds: Principal[];
	identity: OptionIdentity;
} & SetControllerParams) => {
	try {
		const actor = await getMissionControlActor({ missionControlId, identity });
		await actor.set_satellites_controllers(
			satelliteIds,
			[Principal.fromText(controllerId)],
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
	controller,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteIds: Principal[];
	controller: Principal;
	identity: OptionIdentity;
}) => {
	const actor = await getMissionControlActor({ missionControlId, identity });
	await actor.del_satellites_controllers(satelliteIds, [controller]);
};

export const setMissionControlController = async ({
	identity,
	missionControlId,
	controllerId,
	...rest
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
} & SetControllerParams) => {
	try {
		const actor = await getMissionControlActor({ missionControlId, identity });
		await actor.set_mission_control_controllers(
			[Principal.fromText(controllerId)],
			toSetController(rest)
		);
	} catch (err: unknown) {
		console.error('setMissionControlController:', missionControlId.toText());
		throw err;
	}
};

export const deleteMissionControlController = async ({
	missionControlId,
	controller,
	identity
}: {
	missionControlId: MissionControlId;
	controller: Principal;
	identity: OptionIdentity;
}) => {
	const actor = await getMissionControlActor({ missionControlId, identity });
	await actor.del_mission_control_controllers([controller]);
};

/**
 * @deprecated use setSatellitesController
 */
export const addSatellitesController = async ({
	missionControlId,
	satelliteIds,
	controllerId,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteIds: Principal[];
	identity: OptionIdentity;
} & SetControllerParams) => {
	try {
		const actor = await getMissionControlActor({ missionControlId, identity });
		await actor.add_satellites_controllers(satelliteIds, [Principal.fromText(controllerId)]);
	} catch (err: unknown) {
		console.error(
			'addSatellitesController:',
			missionControlId.toText(),
			satelliteIds.map((id) => id.toText()).join(',')
		);
		throw err;
	}
};

/**
 * @deprecated use deleteSatellitesController
 */
export const removeSatellitesController = async ({
	missionControlId,
	satelliteIds,
	controller,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteIds: Principal[];
	controller: Principal;
	identity: OptionIdentity;
}) => {
	const actor = await getMissionControlActor({ missionControlId, identity });
	await actor.remove_satellites_controllers(satelliteIds, [controller]);
};

/**
 * @deprecated use setMissionControlController
 */
export const addMissionControlController = async ({
	missionControlId,
	controllerId,
	identity
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
} & SetControllerParams) => {
	try {
		const actor = await getMissionControlActor({ missionControlId, identity });
		await actor.add_mission_control_controllers([Principal.fromText(controllerId)]);
	} catch (err: unknown) {
		console.error('addMissionControlController:', missionControlId.toText());
		throw err;
	}
};

/**
 * @deprecated use deleteMissionControlController
 */
export const removeMissionControlController = async ({
	missionControlId,
	controller,
	identity
}: {
	missionControlId: MissionControlId;
	controller: Principal;
	identity: OptionIdentity;
}) => {
	const actor = await getMissionControlActor({ missionControlId, identity });
	await actor.remove_mission_control_controllers([controller]);
};

export const listMissionControlControllers = async ({
	missionControlId,
	identity
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
}): Promise<[Principal, MissionControlDid.Controller][]> => {
	const actor = await getMissionControlActor({ missionControlId, identity });
	return actor.list_mission_control_controllers();
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
	identity: OptionIdentity;
}) => {
	const actor = await getMissionControlActor({ missionControlId, identity });
	await actor.top_up(canisterId, { e8s });
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
	identity: OptionIdentity;
}): Promise<MissionControlDid.Satellite> => {
	const actor = await getMissionControlActor({ missionControlId, identity });
	return actor.set_satellite_metadata(satelliteId, metadata);
};

export const setOrbitersController = async ({
	missionControlId,
	orbiterIds,
	controllerId,
	identity,
	...rest
}: {
	missionControlId: MissionControlId;
	orbiterIds: Principal[];
	identity: OptionIdentity;
} & SetControllerParams) => {
	try {
		const actor = await getMissionControlActor({ missionControlId, identity });
		await actor.set_orbiters_controllers(
			orbiterIds,
			[Principal.fromText(controllerId)],
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
	controller,
	identity
}: {
	missionControlId: MissionControlId;
	orbiterIds: Principal[];
	controller: Principal;
	identity: OptionIdentity;
}) => {
	const actor = await getMissionControlActor({ missionControlId, identity });
	await actor.del_orbiters_controllers(orbiterIds, [controller]);
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
}): Promise<MissionControlDid.Result_1> => {
	const { icrc_transfer } = await getMissionControlActor({ missionControlId, identity });
	return icrc_transfer(ledgerId, args);
};

export const getUserData = async ({
	missionControlId,
	identity
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
}): Promise<MissionControlDid.User> => {
	const { get_user_data } = await getMissionControlActor({ missionControlId, identity });
	return get_user_data();
};

export const getSettings = async ({
	missionControlId,

	identity
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
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
	identity: OptionIdentity;
}): Promise<void> => {
	const { set_metadata } = await getMissionControlActor({ missionControlId, identity });
	await set_metadata(metadata);
};
