<script lang="ts">
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';
	import { deleteOrbiter } from '$lib/api/mission-control.api';
	import type { Principal } from '@dfinity/principal';
	import CanisterDeleteWizard from '$lib/components/canister/CanisterDeleteWizard.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { authStore } from '$lib/stores/auth.store';
	import Modal from '$lib/components/ui/Modal.svelte';

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
	<Modal on:junoClose>
		<CanisterDeleteWizard {deleteFn} {currentCycles} on:junoClose segment="analytics" />
	</Modal>
{/if}
