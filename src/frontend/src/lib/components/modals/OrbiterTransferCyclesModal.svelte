<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { depositCycles } from '$lib/api/orbiter.api';
	import CanisterTransferCyclesModal from '$lib/components/modals/CanisterTransferCyclesModal.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';

	export let detail: JunoModalDetail;

	let currentCycles: bigint;

	$: ({ cycles: currentCycles } = detail as JunoModalCycles);

	let transferFn: (params: { cycles: bigint; destinationId: Principal }) => Promise<void>;
	$: transferFn = async (params: { cycles: bigint; destinationId: Principal }) =>
		depositCycles({
			...params,
			orbiterId: $orbiterStore!.orbiter_id,
			identity: $authStore.identity
		});
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
