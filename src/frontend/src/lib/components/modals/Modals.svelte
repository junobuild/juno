<script lang="ts">
	import type { JunoModal } from '$lib/types/modal';
	import SatelliteCreateModal from '$lib/components/modals/SatelliteCreateModal.svelte';
	import SatelliteTopUpModal from '$lib/components/modals/SatelliteTopUpModal.svelte';
	import MissionControlTopUpModal from '$lib/components/modals/MissionControlTopUpModal.svelte';
	import SignInModal from '$lib/components/modals/SignInModal.svelte';
	import CustomDomainModal from '$lib/components/modals/CustomDomainModal.svelte';

	let modal: JunoModal | undefined = undefined;

	const close = () => (modal = undefined);
</script>

<svelte:window on:junoModal={({ detail }) => (modal = detail)} />

{#if modal?.type === 'create_satellite'}
	<SatelliteCreateModal on:junoClose={close} />
{/if}

{#if modal?.type === 'topup_satellite'}
	<SatelliteTopUpModal on:junoClose={close} detail={modal.detail} />
{/if}

{#if modal?.type === 'topup_mission_control'}
	<MissionControlTopUpModal on:junoClose={close} />
{/if}

{#if modal?.type === 'add_custom_domain'}
	<CustomDomainModal on:junoClose={close} detail={modal.detail} />
{/if}
