<script lang="ts">
	import type { JunoModal } from '$lib/types/modal';
	import SatelliteCreateModal from '$lib/components/modals/SatelliteCreateModal.svelte';
	import SatelliteTopUpModal from '$lib/components/modals/SatelliteTopUpModal.svelte';
	import MissionControlTopUpModal from '$lib/components/modals/MissionControlTopUpModal.svelte';
	import CustomDomainModal from '$lib/components/modals/CustomDomainModal.svelte';
	import { nonNullish } from '$lib/utils/utils';
	import ControllerCreateModal from '$lib/components/modals/ControllerCreateModal.svelte';
	import SatelliteUpgradeModal from '$lib/components/modals/SatelliteUpgradeModal.svelte';
	import MissionControlUpgradeModal from '$lib/components/modals/MissionControlUpgradeModal.svelte';
	import OrbiterCreateModal from "$lib/components/modals/OrbiterCreateModal.svelte";

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

{#if modal?.type === 'add_custom_domain' && nonNullish(modal.detail)}
	<CustomDomainModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'create_controller' && nonNullish(modal.detail)}
	<ControllerCreateModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'upgrade_satellite' && nonNullish(modal.detail)}
	<SatelliteUpgradeModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'upgrade_mission_control' && nonNullish(modal.detail)}
	<MissionControlUpgradeModal on:junoClose={close} detail={modal.detail} />
{/if}
