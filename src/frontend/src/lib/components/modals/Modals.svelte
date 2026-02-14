<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import AuthConfigModal from '$lib/components/modals/auth/AuthConfigModal.svelte';
	import UserDetailsModal from '$lib/components/modals/auth/UserDetailsModal.svelte';
	import CreateAutomationModal from '$lib/components/modals/automation/CreateAutomationModal.svelte';
	import ApplyChangeModal from '$lib/components/modals/changes/ApplyChangeModal.svelte';
	import RejectChangeModal from '$lib/components/modals/changes/RejectChangeModal.svelte';
	import MissionControlTopUpModal from '$lib/components/modals/cycles/top-up/MissionControlTopUpModal.svelte';
	import OrbiterTopUpModal from '$lib/components/modals/cycles/top-up/OrbiterTopUpModal.svelte';
	import SatelliteTopUpModal from '$lib/components/modals/cycles/top-up/SatelliteTopUpModal.svelte';
	import MissionControlTransferCyclesModal from '$lib/components/modals/cycles/transfer/MissionControlTransferCyclesModal.svelte';
	import OrbiterTransferCyclesModal from '$lib/components/modals/cycles/transfer/OrbiterTransferCyclesModal.svelte';
	import SatelliteTransferCyclesModal from '$lib/components/modals/cycles/transfer/SatelliteTransferCyclesModal.svelte';
	import MissionControlCreateModal from '$lib/components/modals/factory/create/MissionControlCreateModal.svelte';
	import OrbiterCreateModal from '$lib/components/modals/factory/create/OrbiterCreateModal.svelte';
	import SatelliteCreateModal from '$lib/components/modals/factory/create/SatelliteCreateModal.svelte';
	import OrbiterDeleteModal from '$lib/components/modals/factory/delete/OrbiterDeleteModal.svelte';
	import SatelliteDeleteModal from '$lib/components/modals/factory/delete/SatelliteDeleteModal.svelte';
	import CustomDomainModal from '$lib/components/modals/hosting/CustomDomainModal.svelte';
	import MonitoringDetailsModal from '$lib/components/modals/monitoring/MonitoringDetailsModal.svelte';
	import MonitoringStrategyCreateModal from '$lib/components/modals/monitoring/MonitoringStrategyCreateModal.svelte';
	import StopMonitoringStrategyModal from '$lib/components/modals/monitoring/StopMonitoringStrategyModal.svelte';
	import OutOfSyncSegmentsModal from '$lib/components/modals/out-of-sync/OutOfSyncSegmentsModal.svelte';
	import AccessKeyCreateModal from '$lib/components/modals/setup/AccessKeyCreateModal.svelte';
	import CanisterEditSettingsModal from '$lib/components/modals/setup/CanisterEditSettingsModal.svelte';
	import OrbiterConfigModal from '$lib/components/modals/setup/OrbiterConfigModal.svelte';
	import CanisterRestoreSnapshotModal from '$lib/components/modals/snapshot/CanisterRestoreSnapshotModal.svelte';
	import CreateSnapshotModal from '$lib/components/modals/snapshot/CreateSnapshotModal.svelte';
	import CdnUpgradeModal from '$lib/components/modals/upgrade/CdnUpgradeModal.svelte';
	import MissionControlUpgradeModal from '$lib/components/modals/upgrade/MissionControlUpgradeModal.svelte';
	import OrbiterUpgradeModal from '$lib/components/modals/upgrade/OrbiterUpgradeModal.svelte';
	import SatelliteUpgradeModal from '$lib/components/modals/upgrade/SatelliteUpgradeModal.svelte';
	import ConvertIcpModal from '$lib/components/modals/wallet/ConvertIcpModal.svelte';
	import SendTokensModal from '$lib/components/modals/wallet/SendTokensModal.svelte';
	import type { JunoModal, JunoModalDetail } from '$lib/types/modal';

	let modal: JunoModal<JunoModalDetail> | undefined = $state(undefined);

	const close = () => (modal = undefined);
</script>

<svelte:window onjunoModal={({ detail }) => (modal = detail)} />

{#if modal?.type === 'create_satellite' && nonNullish(modal.detail)}
	<SatelliteCreateModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'create_orbiter' && nonNullish(modal.detail)}
	<OrbiterCreateModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'create_mission_control' && nonNullish(modal.detail)}
	<MissionControlCreateModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'topup_satellite' && nonNullish(modal.detail)}
	<SatelliteTopUpModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'topup_mission_control'}
	<MissionControlTopUpModal onclose={close} />
{/if}

{#if modal?.type === 'topup_orbiter'}
	<OrbiterTopUpModal onclose={close} />
{/if}

{#if modal?.type === 'add_custom_domain' && nonNullish(modal.detail)}
	<CustomDomainModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'create_access_key' && nonNullish(modal.detail)}
	<AccessKeyCreateModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'edit_canister_settings' && nonNullish(modal.detail)}
	<CanisterEditSettingsModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'upgrade_satellite' && nonNullish(modal.detail)}
	<SatelliteUpgradeModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'upgrade_mission_control' && nonNullish(modal.detail)}
	<MissionControlUpgradeModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'upgrade_orbiter' && nonNullish(modal.detail)}
	<OrbiterUpgradeModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'delete_satellite' && nonNullish(modal.detail)}
	<SatelliteDeleteModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'delete_orbiter' && nonNullish(modal.detail)}
	<OrbiterDeleteModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'transfer_cycles_satellite' && nonNullish(modal.detail)}
	<SatelliteTransferCyclesModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'transfer_cycles_orbiter' && nonNullish(modal.detail)}
	<OrbiterTransferCyclesModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'transfer_cycles_mission_control' && nonNullish(modal.detail)}
	<MissionControlTransferCyclesModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'send_tokens' && nonNullish(modal.detail)}
	<SendTokensModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'edit_orbiter_config' && nonNullish(modal.detail)}
	<OrbiterConfigModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'edit_auth_config' && nonNullish(modal.detail)}
	<AuthConfigModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'create_snapshot' && nonNullish(modal.detail)}
	<CreateSnapshotModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'restore_snapshot' && nonNullish(modal.detail)}
	<CanisterRestoreSnapshotModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'create_monitoring_strategy' && nonNullish(modal.detail)}
	<MonitoringStrategyCreateModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'stop_monitoring_strategy' && nonNullish(modal.detail)}
	<StopMonitoringStrategyModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'show_monitoring_details' && nonNullish(modal.detail)}
	<MonitoringDetailsModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'show_user_details' && nonNullish(modal.detail)}
	<UserDetailsModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'apply_change' && nonNullish(modal.detail)}
	<ApplyChangeModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'reject_change' && nonNullish(modal.detail)}
	<RejectChangeModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'upgrade_satellite_with_cdn' && nonNullish(modal.detail)}
	<CdnUpgradeModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'convert_icp_to_cycles' && nonNullish(modal.detail)}
	<ConvertIcpModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'reconcile_out_of_sync_segments'}
	<OutOfSyncSegmentsModal onclose={close} />
{/if}

{#if modal?.type === 'create_automation'}
	<CreateAutomationModal onclose={close} />
{/if}
