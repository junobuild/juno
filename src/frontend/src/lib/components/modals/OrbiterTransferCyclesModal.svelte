<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { depositCycles } from '$lib/api/orbiter.api';
	import CanisterTransferCyclesModal from '$lib/components/modals/CanisterTransferCyclesModal.svelte';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { cycles: currentCycles } = $derived(detail as JunoModalCycles);

	let transferFn: (params: { cycles: bigint; destinationId: Principal }) => Promise<void> =
		$derived(
			async (params: { cycles: bigint; destinationId: Principal }) =>
				await depositCycles({
					...params,
					// TODO: resolve no-non-null-assertion
					// We know for sure that the orbiter is defined at this point.
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					orbiterId: $orbiterStore!.orbiter_id,
					identity: $authStore.identity
				})
		);
</script>

{#if nonNullish($orbiterStore)}
	<CanisterTransferCyclesModal
		{currentCycles}
		{onclose}
		segment={{
			segment: 'orbiter',
			canisterId: $orbiterStore.orbiter_id.toText(),
			label: $i18n.analytics.orbiter
		}}
		{transferFn}
	/>
{/if}
