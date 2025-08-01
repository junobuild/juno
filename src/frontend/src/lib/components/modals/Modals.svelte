<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import ApplyChangeModal from '$lib/components/modals/ApplyChangeModal.svelte';
	import AuthConfigModal from '$lib/components/modals/AuthConfigModal.svelte';
	import CanisterEditSettingsModal from '$lib/components/modals/CanisterEditSettingsModal.svelte';
	import CanisterRestoreSnapshotModal from '$lib/components/modals/CanisterRestoreSnapshotModal.svelte';
	import CdnUpgradeModal from '$lib/components/modals/CdnUpgradeModal.svelte';
	import ControllerCreateModal from '$lib/components/modals/ControllerCreateModal.svelte';
	import CreateMonitoringStrategyModal from '$lib/components/modals/CreateMonitoringStrategyModal.svelte';
	import CreateSnapshotModal from '$lib/components/modals/CreateSnapshotModal.svelte';
	import CustomDomainModal from '$lib/components/modals/CustomDomainModal.svelte';
	import MissionControlTopUpModal from '$lib/components/modals/MissionControlTopUpModal.svelte';
	import MissionControlTransferCyclesModal from '$lib/components/modals/MissionControlTransferCyclesModal.svelte';
	import MissionControlUpgradeModal from '$lib/components/modals/MissionControlUpgradeModal.svelte';
	import MonitoringDetailsModal from '$lib/components/modals/MonitoringDetailsModal.svelte';
	import OrbiterConfigModal from '$lib/components/modals/OrbiterConfigModal.svelte';
	import OrbiterCreateModal from '$lib/components/modals/OrbiterCreateModal.svelte';
	import OrbiterDeleteModal from '$lib/components/modals/OrbiterDeleteModal.svelte';
	import OrbiterTopUpModal from '$lib/components/modals/OrbiterTopUpModal.svelte';
	import OrbiterTransferCyclesModal from '$lib/components/modals/OrbiterTransferCyclesModal.svelte';
	import OrbiterUpgradeModal from '$lib/components/modals/OrbiterUpgradeModal.svelte';
	import RejectChangeModal from '$lib/components/modals/RejectChangeModal.svelte';
	import SatelliteCreateModal from '$lib/components/modals/SatelliteCreateModal.svelte';
	import SatelliteDeleteModal from '$lib/components/modals/SatelliteDeleteModal.svelte';
	import SatelliteTopUpModal from '$lib/components/modals/SatelliteTopUpModal.svelte';
	import SatelliteTransferCyclesModal from '$lib/components/modals/SatelliteTransferCyclesModal.svelte';
	import SatelliteUpgradeModal from '$lib/components/modals/SatelliteUpgradeModal.svelte';
	import SendTokensModal from '$lib/components/modals/SendTokensModal.svelte';
	import StopMonitoringStrategyModal from '$lib/components/modals/StopMonitoringStrategyModal.svelte';
	import UserDetailsModal from '$lib/components/modals/UserDetailsModal.svelte';
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

{#if modal?.type === 'topup_satellite' && nonNullish(modal.detail)}
	<SatelliteTopUpModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'topup_mission_control' && nonNullish(modal.detail)}
	<MissionControlTopUpModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'topup_orbiter' && nonNullish(modal.detail)}
	<OrbiterTopUpModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'add_custom_domain' && nonNullish(modal.detail)}
	<CustomDomainModal detail={modal.detail} onclose={close} />
{/if}

{#if modal?.type === 'create_controller' && nonNullish(modal.detail)}
	<ControllerCreateModal detail={modal.detail} onclose={close} />
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

{#if modal?.type === 'send_tokens'}
	<SendTokensModal onclose={close} />
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
	<CreateMonitoringStrategyModal detail={modal.detail} onclose={close} />
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
