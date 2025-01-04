import type { snapshot } from '$declarations/ic/ic.did';
import type {
	MissionControlSettings,
	Monitoring,
	Satellite
} from '$declarations/mission_control/mission_control.did';
import type { OrbiterSatelliteFeatures } from '$declarations/orbiter/orbiter.did';
import type { AuthenticationConfig, Rule } from '$declarations/satellite/satellite.did';
import type { MissionControlBalance } from '$lib/types/balance';
import type { CanisterSegmentWithLabel, CanisterSettings } from '$lib/types/canister';
import type { SetControllerParams } from '$lib/types/controllers';
import type { CustomDomains } from '$lib/types/custom-domain';
import type { Metadata } from '$lib/types/metadata';
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

export interface JunoModalSegmentDetail {
	segment: CanisterSegmentWithLabel;
}

export interface JunoModalCreateControllerDetail extends JunoModalSegmentDetail {
	add: (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	) => Promise<void>;
	load: () => Promise<void>;
}

export interface JunoModalEditCanisterSettingsDetail extends JunoModalSegmentDetail {
	settings: CanisterSettings;
}

export interface JunoModalRestoreSnapshotDetail extends JunoModalSegmentDetail {
	snapshot: snapshot;
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

export interface JunoModalMonitoringStrategyDetail {
	missionControlId: Principal;
	settings: MissionControlSettings | undefined;
	metadata: Metadata;
}

export interface JunoModalShowMonitoringDetail extends JunoModalSegmentDetail {
	monitoring: Monitoring | undefined;
}

export type JunoModalDetail =
	| JunoModalTopUpSatelliteDetail
	| JunoModalTopUpMissionControlDetail
	| JunoModalCreateSegmentDetail
	| JunoModalCustomDomainDetail
	| JunoModalCreateControllerDetail
	| JunoModalEditCanisterSettingsDetail
	| JunoModalRestoreSnapshotDetail
	| JunoModalCyclesSatelliteDetail
	| JunoModalDeleteSatelliteDetail
	| JunoModalSendTokensDetail
	| JunoModalEditOrbiterConfigDetail
	| JunoModalMonitoringStrategyDetail;

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
		| 'restore_snapshot'
		| 'create_snapshot'
		| 'create_controller'
		| 'edit_canister_settings'
		| 'edit_orbiter_config'
		| 'edit_auth_config'
		| 'upgrade_satellite'
		| 'upgrade_mission_control'
		| 'upgrade_orbiter'
		| 'send_tokens'
		| 'create_monitoring_strategy'
		| 'stop_monitoring_strategy'
		| 'show_monitoring_details';
	detail?: JunoModalDetail;
}
