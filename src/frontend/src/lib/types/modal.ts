import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { SetControllerParams } from '$lib/types/controllers';
import type { Principal } from '@dfinity/principal';

export interface JunoModalBalance {
	missionControlBalance?: {
		balance: bigint;
		credits: bigint;
	};
}

export interface JunoModalTopUpSatelliteDetail extends JunoModalBalance {
	satellite: Satellite;
}

export interface JunoModalTopUpMissionControlDetail extends JunoModalBalance {}

export interface JunoModalCreateSatelliteDetail extends JunoModalBalance {
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
	| JunoModalCreateSatelliteDetail
	| JunoModalCustomDomainDetail
	| JunoModalCreateControllerDetail;

export interface JunoModal {
	type:
		| 'create_satellite'
		| 'topup_satellite'
		| 'topup_mission_control'
		| 'add_custom_domain'
		| 'create_controller';
	detail?: JunoModalDetail;
}
