import type { ConsoleDid, ICDid, MissionControlDid, OrbiterDid, SatelliteDid } from '$declarations';
import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
import type { AddAccessKeyParams, AddAccessKeyResult } from '$lib/types/access-keys';
import type { CanisterInfo, CanisterSegmentWithLabel, CanisterSettings } from '$lib/types/canister';
import type { MissionControlId } from '$lib/types/mission-control';
import type { OrbiterSatelliteConfigEntry } from '$lib/types/orbiter';
import type { ProposalRecord } from '$lib/types/proposals';
import type { Satellite, SatelliteIdText } from '$lib/types/satellite';
import type { User as UserListed } from '$lib/types/user';
import type { UserUsageCollection } from '$lib/types/user-usage';
import type { Option } from '$lib/types/utils';
import type { Principal } from '@icp-sdk/core/principal';
import type { BuildType } from '@junobuild/admin';

export interface JunoModalWithSatellite {
	satellite: Satellite;
}

export type JunoModalTopUpSatelliteDetail = JunoModalWithSatellite;

export interface JunoModalTopUpMissionControlDetail {}

export interface JunoModalTopUpOrbiterDetail {}

export interface JunoModalUpgradeDetail {
	currentVersion: string;
	newerReleases: string[];
}

export type JunoModalUpgradeSatelliteDetail = JunoModalUpgradeDetail &
	JunoModalWithSatellite & { build?: BuildType };

export interface JunoModalCreateSegmentDetail {
	fee: ConsoleDid.FactoryFee;
	monitoringEnabled: boolean;
	monitoringConfig: Option<MissionControlDid.MonitoringConfig>;
}

export interface JunoModalCustomDomainDetail {
	editDomainName?: string;
	satellite: Satellite;
	config: SatelliteDid.AuthenticationConfig | null | undefined;
}

export interface JunoModalCycles {
	cycles: bigint;
}

export interface JunoModalDeleteSegmentDetail extends JunoModalCycles {
	monitoringEnabled: boolean;
}

export type JunoModalCyclesSatelliteDetail = JunoModalCycles & JunoModalWithSatellite;

export type JunoModalDeleteSatelliteDetail = JunoModalDeleteSegmentDetail & JunoModalWithSatellite;

export interface JunoModalSegmentDetail {
	segment: CanisterSegmentWithLabel;
}

export interface JunoModalCreateControllerDetail extends JunoModalSegmentDetail {
	add: (params: AddAccessKeyParams) => Promise<AddAccessKeyResult>;
	load: () => Promise<void>;
}

export interface JunoModalEditCanisterSettingsDetail extends JunoModalSegmentDetail {
	settings: CanisterSettings;
	canister: CanisterInfo;
}

export interface JunoModalRestoreSnapshotDetail extends JunoModalSegmentDetail {
	snapshot: ICDid.snapshot;
}

export interface JunoModalEditOrbiterConfigDetail {
	orbiterId: Principal;
	features: OrbiterDid.OrbiterSatelliteFeatures | undefined;
	config: Record<SatelliteIdText, OrbiterSatelliteConfigEntry>;
}

export type JunoModalEditAuthConfigDetail = JunoModalWithSatellite & {
	config: SatelliteDid.AuthenticationConfig | undefined;
} & JunoModalEditAuthConfigDetailType;

export interface JunoModalEditAuthConfigDetailCore {
	core: {
		rule: SatelliteDid.Rule | undefined;
	};
}

export type JunoModalEditAuthConfigDetailType =
	| JunoModalEditAuthConfigDetailCore
	| JunoModalEditAuthConfigDetailII
	| JunoModalEditAuthConfigDetailGoogle;

export interface JunoModalEditAuthConfigDetailGoogle {
	google: null;
}

export interface JunoModalEditAuthConfigDetailII {
	internet_identity: null;
}

export interface JunoModalCreateMonitoringStrategyDetail {
	missionControlId: MissionControlId;
	settings: MissionControlDid.MissionControlSettings | undefined;
	user: MissionControlDid.User;
}

export interface JunoModalShowMonitoringDetail extends JunoModalSegmentDetail {
	monitoring: MissionControlDid.Monitoring | undefined;
}

export interface JunoModalShowUserDetail {
	user: UserListed;
	usages: UserUsageCollection[];
}

export interface JunoModalChangeDetail extends JunoModalWithSatellite {
	proposal: ProposalRecord;
}

export interface JunoModalCdnUpgradeDetail extends JunoModalWithSatellite {
	asset: SatelliteDid.AssetNoContent;
}

export interface JunoModalWalletDetail {
	selectedWallet: SelectedWallet;
	selectedToken: SelectedToken;
}

export type JunoModalConvertIcpToCyclesDetails = Pick<JunoModalWalletDetail, 'selectedWallet'>;

export interface JunoModalAutomationConfigDetail extends JunoModalWithSatellite {
	config: SatelliteDid.OpenIdAutomationProviderConfig;
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
	| JunoModalChangeDetail
	| JunoModalCdnUpgradeDetail
	| JunoModalEditAuthConfigDetail
	| JunoModalWalletDetail
	| JunoModalAutomationConfigDetail;

export interface JunoModal<T extends JunoModalDetail> {
	type:
		| 'create_satellite'
		| 'create_orbiter'
		| 'create_mission_control'
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
		| 'create_access_key'
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
		| 'apply_change'
		| 'reject_change'
		| 'upgrade_satellite_with_cdn'
		| 'convert_icp_to_cycles'
		| 'reconcile_out_of_sync_segments'
		| 'create_automation'
		| 'edit_automation_keys_config';
	detail?: T;
}
