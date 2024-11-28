<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import AuthConfigModal from '$lib/components/modals/AuthConfigModal.svelte';
	import CanisterCreateSnapshotModal from '$lib/components/modals/CanisterCreateSnapshotModal.svelte';
	import CanisterEditSettingsModal from '$lib/components/modals/CanisterEditSettingsModal.svelte';
	import ControllerCreateModal from '$lib/components/modals/ControllerCreateModal.svelte';
	import CustomDomainModal from '$lib/components/modals/CustomDomainModal.svelte';
	import MissionControlTopUpModal from '$lib/components/modals/MissionControlTopUpModal.svelte';
	import MissionControlTransferCyclesModal from '$lib/components/modals/MissionControlTransferCyclesModal.svelte';
	import MissionControlUpgradeModal from '$lib/components/modals/MissionControlUpgradeModal.svelte';
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
	import type { JunoModal } from '$lib/types/modal';

	let modal: JunoModal | undefined = $state(undefined);

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
	<SatelliteTopUpModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'topup_mission_control' && nonNullish(modal.detail)}
	<MissionControlTopUpModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'topup_orbiter' && nonNullish(modal.detail)}
	<OrbiterTopUpModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'add_custom_domain' && nonNullish(modal.detail)}
	<CustomDomainModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'create_controller' && nonNullish(modal.detail)}
	<ControllerCreateModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'edit_canister_settings' && nonNullish(modal.detail)}
	<CanisterEditSettingsModal on:junoClose={close} detail={modal.detail} />
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
	<SatelliteDeleteModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'delete_orbiter' && nonNullish(modal.detail)}
	<OrbiterDeleteModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'transfer_cycles_satellite' && nonNullish(modal.detail)}
	<SatelliteTransferCyclesModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'transfer_cycles_orbiter' && nonNullish(modal.detail)}
	<OrbiterTransferCyclesModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'transfer_cycles_mission_control' && nonNullish(modal.detail)}
	<MissionControlTransferCyclesModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'send_tokens' && nonNullish(modal.detail)}
	<SendTokensModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'edit_orbiter_config' && nonNullish(modal.detail)}
	<OrbiterConfigModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'edit_auth_config' && nonNullish(modal.detail)}
	<AuthConfigModal onclose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'create_snapshot' && nonNullish(modal.detail)}
	<CanisterCreateSnapshotModal onclose={close} detail={modal.detail} />
{/if}
