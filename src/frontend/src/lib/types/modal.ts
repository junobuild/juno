import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { OrbiterSatelliteFeatures } from '$declarations/orbiter/orbiter.did';
import type { AuthenticationConfig, Rule } from '$declarations/satellite/satellite.did';
import type { MissionControlBalance } from '$lib/types/balance';
import type { CanisterSegmentWithLabel, CanisterSettings } from '$lib/types/canister';
import type { SetControllerParams } from '$lib/types/controllers';
import type { CustomDomains } from '$lib/types/custom-domain';
import type { OrbiterSatelliteConfigEntry } from '$lib/types/ortbiter';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { Principal } from '@dfinity/principal';
import type { BuildType } from '@junobuild/admin';

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

export type JunoModalUpgradeSatelliteDetail = JunoModalUpgradeDetail &
	JunoModalSatelliteDetail & { build?: BuildType };

export interface JunoModalCreateSegmentDetail extends JunoModalBalance {
	fee: bigint;
}

export interface JunoModalCustomDomainDetail {
	editDomainName?: string;
	satellite: Satellite;
	config: AuthenticationConfig | undefined;
}

export interface JunoModalCycles {
	cycles: bigint;
}

export interface JunoModalCustomDomainsDetail {
	customDomains: CustomDomains;
}

export type JunoModalCyclesSatelliteDetail = JunoModalCycles & JunoModalSatelliteDetail;

export type JunoModalDeleteSatelliteDetail = JunoModalCycles &
	JunoModalCustomDomainsDetail &
	JunoModalSatelliteDetail;

export interface JunoModalCreateControllerDetail {
	add: (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	) => Promise<void>;
	load: () => Promise<void>;
	segment: CanisterSegmentWithLabel;
}

export interface JunoModalEditCanisterSettingsDetail {
	segment: CanisterSegmentWithLabel;
	settings: CanisterSettings;
}

export interface JunoModalSendTokensDetail {
	balance: bigint | undefined;
}

export interface JunoModalEditOrbiterConfigDetail {
	orbiterId: Principal;
	features: OrbiterSatelliteFeatures | undefined;
	config: Record<SatelliteIdText, OrbiterSatelliteConfigEntry>;
}

export interface JunoModalEditAuthConfigDetail extends JunoModalSatelliteDetail {
	rule: Rule | undefined;
	config: AuthenticationConfig | undefined;
}

export type JunoModalDetail =
	| JunoModalTopUpSatelliteDetail
	| JunoModalTopUpMissionControlDetail
	| JunoModalCreateSegmentDetail
	| JunoModalCustomDomainDetail
	| JunoModalCreateControllerDetail
	| JunoModalCyclesSatelliteDetail
	| JunoModalDeleteSatelliteDetail
	| JunoModalSendTokensDetail
	| JunoModalEditOrbiterConfigDetail;

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
		| 'edit_canister_settings'
		| 'edit_orbiter_config'
		| 'edit_auth_config'
		| 'upgrade_satellite'
		| 'upgrade_mission_control'
		| 'upgrade_orbiter'
		| 'send_tokens';
	detail?: JunoModalDetail;
}
