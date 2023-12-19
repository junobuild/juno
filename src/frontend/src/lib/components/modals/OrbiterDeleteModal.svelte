<script lang="ts">
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';
	import { deleteOrbiter } from '$lib/api/mission-control.api';
	import type { Principal } from '@dfinity/principal';
	import CanisterDeleteModal from '$lib/components/modals/CanisterDeleteModal.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { authStore } from '$lib/stores/auth.store';

	export let detail: JunoModalDetail;

	let currentCycles: bigint;

	$: ({ cycles: currentCycles } = detail as JunoModalCycles);

	let deleteFn: (params: { missionControlId: Principal; cyclesToDeposit: bigint }) => Promise<void>;
	$: deleteFn = async (params: { missionControlId: Principal; cyclesToDeposit: bigint }) =>
		deleteOrbiter({
			...params,
			orbiterId: $orbiterStore!.orbiter_id,
			identity: $authStore.identity
		});
</script>

{#if nonNullish($orbiterStore)}
	<CanisterDeleteModal {deleteFn} {currentCycles} on:junoClose segment="analytics" />
{/if}
