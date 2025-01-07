<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { depositCycles } from '$lib/api/mission-control.api';
	import CanisterTransferCyclesModal from '$lib/components/modals/CanisterTransferCyclesModal.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { authStore } from '$lib/stores/auth.store';
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let { cycles: currentCycles } = $derived(detail as JunoModalCycles);

	let transferFn: (params: { cycles: bigint; destinationId: Principal }) => Promise<void> =
		$derived(
			async (params: { cycles: bigint; destinationId: Principal }) =>
				await depositCycles({
					...params,
					missionControlId: $missionControlIdDerived!,
					identity: $authStore.identity
				})
		);
</script>

{#if nonNullish($missionControlIdDerived)}
	<CanisterTransferCyclesModal
		{transferFn}
		{currentCycles}
		canisterId={$missionControlIdDerived}
		on:junoClose
		segment="mission_control"
	/>
{/if}
