<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { deleteOrbiter } from '$lib/api/mission-control.api';
	import CanisterDeleteWizard from '$lib/components/canister/CanisterDeleteWizard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { authStore } from '$lib/stores/auth.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let { cycles: currentCycles } = $derived(detail as JunoModalCycles);

	let deleteFn: (params: {
		missionControlId: MissionControlId;
		cyclesToDeposit: bigint;
	}) => Promise<void> = $derived(
		async (params: { missionControlId: MissionControlId; cyclesToDeposit: bigint }) =>
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
