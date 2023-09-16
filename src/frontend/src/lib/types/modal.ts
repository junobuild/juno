import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { MissionControlBalance } from '$lib/services/balance.services';
import type { SetControllerParams } from '$lib/types/controllers';
import type { Principal } from '@dfinity/principal';

export interface JunoModalBalance {
	missionControlBalance?: MissionControlBalance;
}

export interface JunoModalSatelliteDetail {
	satellite: Satellite;
}

export type JunoModalTopUpSatelliteDetail = JunoModalBalance & JunoModalSatelliteDetail;

export interface JunoModalTopUpMissionControlDetail extends JunoModalBalance {}

export interface JunoModalUpgradeDetail {
	currentVersion: string;
	newerReleases: string[];
}

export type JunoModalUpgradeSatelliteDetail = JunoModalUpgradeDetail & JunoModalSatelliteDetail;

export interface JunoModalUpgradeMissionControlDetail extends JunoModalUpgradeDetail {}

export interface JunoModalCreateSegmentDetail extends JunoModalBalance {
	fee: bigint;
}

export interface JunoModalCustomDomainDetail {
	editDomainName?: string;
	satellite: Satellite;
}

export interface JunoModalCreateControllerDetail {
	add: (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	) => Promise<void>;
	load: () => Promise<void>;
}

export type JunoModalDetail =
	| JunoModalTopUpSatelliteDetail
	| JunoModalTopUpMissionControlDetail
	| JunoModalCreateSegmentDetail
	| JunoModalCustomDomainDetail
	| JunoModalCreateControllerDetail;

export interface JunoModal {
	type:
		| 'create_satellite'
		| 'create_orbiter'
		| 'topup_satellite'
		| 'topup_mission_control'
		| 'add_custom_domain'
		| 'create_controller'
		| 'upgrade_satellite'
		| 'upgrade_mission_control';
	detail?: JunoModalDetail;
}
