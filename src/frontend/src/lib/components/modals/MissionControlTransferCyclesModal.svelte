<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { depositCycles } from '$lib/api/mission-control.api';
	import CanisterTransferCyclesModal from '$lib/components/modals/CanisterTransferCyclesModal.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let currentCycles: bigint = $state();

	run(() => {
		({ cycles: currentCycles } = detail as JunoModalCycles);
	});

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
