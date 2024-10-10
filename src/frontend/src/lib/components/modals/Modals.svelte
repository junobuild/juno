<script lang="ts">
	import type { JunoModal } from '$lib/types/modal';
	import SatelliteCreateModal from '$lib/components/modals/SatelliteCreateModal.svelte';
	import SatelliteTopUpModal from '$lib/components/modals/SatelliteTopUpModal.svelte';
	import MissionControlTopUpModal from '$lib/components/modals/MissionControlTopUpModal.svelte';
	import CustomDomainModal from '$lib/components/modals/CustomDomainModal.svelte';
	import { nonNullish } from '@dfinity/utils';
	import ControllerCreateModal from '$lib/components/modals/ControllerCreateModal.svelte';
	import SatelliteUpgradeModal from '$lib/components/modals/SatelliteUpgradeModal.svelte';
	import MissionControlUpgradeModal from '$lib/components/modals/MissionControlUpgradeModal.svelte';
	import OrbiterCreateModal from '$lib/components/modals/OrbiterCreateModal.svelte';
	import OrbiterUpgradeModal from '$lib/components/modals/OrbiterUpgradeModal.svelte';
	import OrbiterTopUpModal from '$lib/components/modals/OrbiterTopUpModal.svelte';
	import SatelliteDeleteModal from '$lib/components/modals/SatelliteDeleteModal.svelte';
	import OrbiterDeleteModal from '$lib/components/modals/OrbiterDeleteModal.svelte';
	import SatelliteTransferCyclesModal from '$lib/components/modals/SatelliteTransferCyclesModal.svelte';
	import OrbiterTransferCyclesModal from '$lib/components/modals/OrbiterTransferCyclesModal.svelte';
	import MissionControlTransferCyclesModal from '$lib/components/modals/MissionControlTransferCyclesModal.svelte';
	import CanisterEditSettingsModal from '$lib/components/modals/CanisterEditSettingsModal.svelte';
	import SendTokensModal from '$lib/components/modals/SendTokensModal.svelte';

	let modal: JunoModal | undefined = undefined;

	const close = () => (modal = undefined);
</script>

<svelte:window on:junoModal={({ detail }) => (modal = detail)} />

{#if modal?.type === 'create_satellite' && nonNullish(modal.detail)}
	<SatelliteCreateModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'create_orbiter' && nonNullish(modal.detail)}
	<OrbiterCreateModal on:junoClose={close} detail={modal.detail} />
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
	<SatelliteUpgradeModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'upgrade_mission_control' && nonNullish(modal.detail)}
	<MissionControlUpgradeModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'upgrade_orbiter' && nonNullish(modal.detail)}
	<OrbiterUpgradeModal on:junoClose={close} detail={modal.detail} />
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
