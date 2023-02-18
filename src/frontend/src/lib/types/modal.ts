import type { Satellite } from '$declarations/mission_control/mission_control.did';

export interface JunoModalSatelliteDetail {
	satellite: Satellite;
}

export interface JunoModalCreateSatelliteDetail {
	fee: bigint;
	missionControlBalance?: {
		balance: bigint;
		credits: bigint;
	};
}

export interface JunoModalCustomDomainDetail extends JunoModalSatelliteDetail {
	editDomainName?: string;
}

export type JunoModalDetail =
	| JunoModalSatelliteDetail
	| JunoModalCreateSatelliteDetail
	| JunoModalCustomDomainDetail;

export interface JunoModal {
	type: 'create_satellite' | 'topup_satellite' | 'topup_mission_control' | 'add_custom_domain';
	detail?: JunoModalDetail;
}
