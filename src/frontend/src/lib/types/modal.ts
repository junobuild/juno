import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { MissionControlBalance } from '$lib/types/balance.types';
import type { SetControllerParams } from '$lib/types/controllers';
import type { Principal } from '@dfinity/principal';

export interface JunoModalBalance {
	missionControlBalance?: MissionControlBalance;
}

export interface JunoModalSatelliteDetail {
	satellite: Satellite;
}

export type JunoModalTopUpSatelliteDetail = JunoModalBalance & JunoModalSatelliteDetail;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JunoModalTopUpMissionControlDetail extends JunoModalBalance {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JunoModalTopUpOrbiterDetail extends JunoModalBalance {}

export interface JunoModalUpgradeDetail {
	currentVersion: string;
	newerReleases: string[];
}

export type JunoModalUpgradeSatelliteDetail = JunoModalUpgradeDetail & JunoModalSatelliteDetail;

export interface JunoModalCreateSegmentDetail extends JunoModalBalance {
	fee: bigint;
}

export interface JunoModalCustomDomainDetail {
	editDomainName?: string;
	satellite: Satellite;
}

export interface JunoModalCycles {
	cycles: bigint;
}

export type JunoModalCyclesSatelliteDetail = JunoModalCycles & JunoModalSatelliteDetail;

export interface JunoModalCreateControllerDetail {
	add: (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	) => Promise<void>;
	load: () => Promise<void>;
	segment: {
		label: string;
		id: Principal;
	};
}

export type JunoModalDetail =
	| JunoModalTopUpSatelliteDetail
	| JunoModalTopUpMissionControlDetail
	| JunoModalCreateSegmentDetail
	| JunoModalCustomDomainDetail
	| JunoModalCreateControllerDetail
	| JunoModalCyclesSatelliteDetail;

export interface JunoModal {
	type:
		| 'create_satellite'
		| 'create_orbiter'
		| 'delete_satellite'
		| 'delete_orbiter'
		| 'transfer_cycles_satellite'
		| 'transfer_cycles_mission_control'
		| 'transfer_cycles_orbiter'
		| 'topup_satellite'
		| 'topup_mission_control'
		| 'topup_orbiter'
		| 'add_custom_domain'
		| 'create_controller'
		| 'upgrade_satellite'
		| 'upgrade_mission_control'
		| 'upgrade_orbiter';
	detail?: JunoModalDetail;
}
