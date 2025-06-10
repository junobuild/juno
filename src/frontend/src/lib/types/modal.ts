import type { snapshot } from '$declarations/ic/ic.did';
import type {
	MissionControlSettings,
	Monitoring,
	MonitoringConfig,
	Satellite,
	User
} from '$declarations/mission_control/mission_control.did';
import type { OrbiterSatelliteFeatures } from '$declarations/orbiter/orbiter.did';
import type { AuthenticationConfig, Rule } from '$declarations/satellite/satellite.did';
import type { CanisterSegmentWithLabel, CanisterSettings } from '$lib/types/canister';
import type { SetControllerParams } from '$lib/types/controllers';
import type { CustomDomains } from '$lib/types/custom-domain';
import type { MissionControlId } from '$lib/types/mission-control';
import type { OrbiterSatelliteConfigEntry } from '$lib/types/orbiter';
import type { ProposalRecord } from '$lib/types/proposals';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { User as UserListed } from '$lib/types/user';
import type { UserUsageCollection } from '$lib/types/user-usage';
import type { Option } from '$lib/types/utils';
import type { AccountIdentifier } from '@dfinity/ledger-icp';
import type { Principal } from '@dfinity/principal';
import type { BuildType } from '@junobuild/admin';

export interface JunoModalWithAccountIdentifier {
	accountIdentifier: AccountIdentifier;
}

export interface JunoModalWithSatellite {
	satellite: Satellite;
}

export type JunoModalTopUpSatelliteDetail = JunoModalWithAccountIdentifier & JunoModalWithSatellite;

export interface JunoModalTopUpMissionControlDetail extends JunoModalWithAccountIdentifier {}

export interface JunoModalTopUpOrbiterDetail extends JunoModalWithAccountIdentifier {}

export interface JunoModalUpgradeDetail {
	currentVersion: string;
	newerReleases: string[];
}

export type JunoModalUpgradeSatelliteDetail = JunoModalUpgradeDetail &
	JunoModalWithSatellite & { build?: BuildType };

export interface JunoModalCreateSegmentDetail extends JunoModalWithAccountIdentifier {
	fee: bigint;
	monitoringEnabled: boolean;
	monitoringConfig: Option<MonitoringConfig>;
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

export type JunoModalCyclesSatelliteDetail = JunoModalCycles & JunoModalWithSatellite;

export type JunoModalDeleteSatelliteDetail = JunoModalCycles &
	JunoModalCustomDomainsDetail &
	JunoModalWithSatellite;

export interface JunoModalSegmentDetail {
	segment: CanisterSegmentWithLabel;
}

export interface JunoModalCreateControllerDetail extends JunoModalSegmentDetail {
	add: (
		params: {
			missionControlId: MissionControlId;
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

export interface JunoModalEditOrbiterConfigDetail {
	orbiterId: Principal;
	features: OrbiterSatelliteFeatures | undefined;
	config: Record<SatelliteIdText, OrbiterSatelliteConfigEntry>;
}

export interface JunoModalEditAuthConfigDetail extends JunoModalWithSatellite {
	rule: Rule | undefined;
	config: AuthenticationConfig | undefined;
}

export interface JunoModalCreateMonitoringStrategyDetail {
	missionControlId: MissionControlId;
	settings: MissionControlSettings | undefined;
	user: User;
}

export interface JunoModalShowMonitoringDetail extends JunoModalSegmentDetail {
	monitoring: Monitoring | undefined;
}

export interface JunoModalShowUserDetail {
	user: UserListed;
	usages: UserUsageCollection[];
}

export interface JunoModalApplyProposal {
	proposal: ProposalRecord;
}

export type JunoModalDetail =
	| JunoModalUpgradeSatelliteDetail
	| JunoModalUpgradeDetail
	| JunoModalShowMonitoringDetail
	| JunoModalTopUpSatelliteDetail
	| JunoModalTopUpMissionControlDetail
	| JunoModalCreateSegmentDetail
	| JunoModalCustomDomainDetail
	| JunoModalCreateControllerDetail
	| JunoModalEditCanisterSettingsDetail
	| JunoModalRestoreSnapshotDetail
	| JunoModalCyclesSatelliteDetail
	| JunoModalDeleteSatelliteDetail
	| JunoModalEditOrbiterConfigDetail
	| JunoModalCreateMonitoringStrategyDetail
	| JunoModalShowUserDetail
	| JunoModalApplyProposal;

export interface JunoModal<T extends JunoModalDetail> {
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
		| 'show_monitoring_details'
		| 'show_user_details'
		| 'apply_proposal';
	detail?: T;
}
