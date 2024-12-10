<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { depositCycles } from '$lib/api/mission-control.api';
	import CanisterTransferCyclesModal from '$lib/components/modals/CanisterTransferCyclesModal.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';
	import { missionControlStore } from '$lib/derived/mission-control.derived';

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
					missionControlId: $missionControlStore!,
					identity: $authStore.identity
				})
		);
</script>

{#if nonNullish($missionControlStore)}
	<CanisterTransferCyclesModal
		{transferFn}
		{currentCycles}
		canisterId={$missionControlStore}
		on:junoClose
		segment="mission_control"
	/>
{/if}
