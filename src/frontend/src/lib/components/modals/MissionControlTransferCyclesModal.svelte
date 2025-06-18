<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { depositCycles } from '$lib/api/mission-control.api';
	import CanisterTransferCyclesModal from '$lib/components/modals/CanisterTransferCyclesModal.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
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
					// We know for sure that the mission control is defined at this point.
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					missionControlId: $missionControlIdDerived!,
					identity: $authStore.identity
				})
		);
</script>

{#if nonNullish($missionControlIdDerived)}
	<CanisterTransferCyclesModal
		{transferFn}
		{currentCycles}
		{onclose}
		segment={{
			segment: 'mission_control',
			canisterId: $missionControlIdDerived.toText(),
			label: $i18n.mission_control.title
		}}
	/>
{/if}
