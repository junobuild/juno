<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { deleteOrbiter } from '$lib/api/mission-control.api';
	import CanisterDeleteWizard from '$lib/components/canister/CanisterDeleteWizard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let currentCycles: bigint = $state();

	run(() => {
		({ cycles: currentCycles } = detail as JunoModalCycles);
	});

	let deleteFn: (params: {
		missionControlId: Principal;
		cyclesToDeposit: bigint;
	}) => Promise<void> = $derived(
		async (params: { missionControlId: Principal; cyclesToDeposit: bigint }) =>
			await deleteOrbiter({
				...params,
				orbiterId: $orbiterStore!.orbiter_id,
				identity: $authStore.identity
			})
	);
</script>

{#if nonNullish($orbiterStore)}
	<Modal on:junoClose>
		<CanisterDeleteWizard {deleteFn} {currentCycles} on:junoClose segment="analytics" />
	</Modal>
{/if}
