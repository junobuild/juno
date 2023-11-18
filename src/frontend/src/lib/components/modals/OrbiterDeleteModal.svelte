<script lang="ts">
	import type { JunoModalDeleteOrbiterDetail, JunoModalDetail } from '$lib/types/modal';
	import { deleteOrbiter } from '$lib/api/mission-control.api';
	import type { Principal } from '@dfinity/principal';
	import CanisterDeleteModal from '$lib/components/modals/CanisterDeleteModal.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';

	export let detail: JunoModalDetail;

	let currentCycles: bigint;

	$: ({ cycles: currentCycles } = detail as JunoModalDeleteOrbiterDetail);

	let deleteFn: (params: {
		missionControlId: Principal;
		cycles_to_retain: bigint;
	}) => Promise<void>;
	$: deleteFn = async (params: { missionControlId: Principal; cycles_to_retain: bigint }) =>
		deleteOrbiter({
			...params,
			orbiterId: $orbiterStore!.orbiter_id
		});
</script>

{#if nonNullish($orbiterStore)}
	<CanisterDeleteModal {deleteFn} {currentCycles} on:junoClose segment="analytics" />
{/if}
