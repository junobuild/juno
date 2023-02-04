import type { Satellite } from '$declarations/mission_control/mission_control.did';

export interface JunoModalSatelliteDetail {
	satellite: Satellite;
}

export interface JunoModal {
	type: 'create_satellite' | 'topup_satellite' | 'topup_mission_control' | 'add_custom_domain';
	detail?: JunoModalSatelliteDetail;
}
