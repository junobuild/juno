<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import { depositCycles } from '$lib/api/orbiter.api';
	import CanisterTransferCyclesModal from '$lib/components/modals/CanisterTransferCyclesModal.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';
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
					orbiterId: $orbiterStore!.orbiter_id,
					identity: $authStore.identity
				})
		);
</script>

{#if nonNullish($orbiterStore)}
	<CanisterTransferCyclesModal
		{transferFn}
		{currentCycles}
		canisterId={$orbiterStore.orbiter_id}
		on:junoClose
		segment="analytics"
	/>
{/if}
