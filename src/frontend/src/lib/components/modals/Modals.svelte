<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import AuthConfigModal from '$lib/components/modals/AuthConfigModal.svelte';
	import CanisterEditSettingsModal from '$lib/components/modals/CanisterEditSettingsModal.svelte';
	import CanisterRestoreSnapshotModal from '$lib/components/modals/CanisterRestoreSnapshotModal.svelte';
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
	<SatelliteCreateModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'create_orbiter' && nonNullish(modal.detail)}
	<OrbiterCreateModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'topup_satellite' && nonNullish(modal.detail)}
	<SatelliteTopUpModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'topup_mission_control' && nonNullish(modal.detail)}
	<MissionControlTopUpModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'topup_orbiter' && nonNullish(modal.detail)}
	<OrbiterTopUpModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'add_custom_domain' && nonNullish(modal.detail)}
	<CustomDomainModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'create_controller' && nonNullish(modal.detail)}
	<ControllerCreateModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'edit_canister_settings' && nonNullish(modal.detail)}
	<CanisterEditSettingsModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'upgrade_satellite' && nonNullish(modal.detail)}
	<SatelliteUpgradeModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'upgrade_mission_control' && nonNullish(modal.detail)}
	<MissionControlUpgradeModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'upgrade_orbiter' && nonNullish(modal.detail)}
	<OrbiterUpgradeModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'delete_satellite' && nonNullish(modal.detail)}
	<SatelliteDeleteModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'delete_orbiter' && nonNullish(modal.detail)}
	<OrbiterDeleteModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'transfer_cycles_satellite' && nonNullish(modal.detail)}
	<SatelliteTransferCyclesModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'transfer_cycles_orbiter' && nonNullish(modal.detail)}
	<OrbiterTransferCyclesModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'transfer_cycles_mission_control' && nonNullish(modal.detail)}
	<MissionControlTransferCyclesModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'send_tokens'}
	<SendTokensModal onclose={close} />
{/if}

{#if modal?.type === 'edit_orbiter_config' && nonNullish(modal.detail)}
	<OrbiterConfigModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'edit_auth_config' && nonNullish(modal.detail)}
	<AuthConfigModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'create_snapshot' && nonNullish(modal.detail)}
	<CreateSnapshotModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'restore_snapshot' && nonNullish(modal.detail)}
	<CanisterRestoreSnapshotModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'create_monitoring_strategy' && nonNullish(modal.detail)}
	<CreateMonitoringStrategyModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'stop_monitoring_strategy' && nonNullish(modal.detail)}
	<StopMonitoringStrategyModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'show_monitoring_details' && nonNullish(modal.detail)}
	<MonitoringDetailsModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'show_user_details' && nonNullish(modal.detail)}
	<UserDetailsModal onclose={close} detail={modal.detail} />
{/if}
