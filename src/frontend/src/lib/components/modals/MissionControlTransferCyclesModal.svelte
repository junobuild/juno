<script lang="ts">
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import CanisterTransferCyclesModal from '$lib/components/modals/CanisterTransferCyclesModal.svelte';
	import { depositCycles } from '$lib/api/mission-control.api';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { authStore } from '$lib/stores/auth.store';

	export let detail: JunoModalDetail;

	let currentCycles: bigint;

	$: ({ cycles: currentCycles } = detail as JunoModalCycles);

	let transferFn: (params: { cycles: bigint; destinationId: Principal }) => Promise<void>;
	$: transferFn = async (params: { cycles: bigint; destinationId: Principal }) =>
		depositCycles({
			...params,
			missionControlId: $missionControlStore!,
			identity: $authStore.identity
		});
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
