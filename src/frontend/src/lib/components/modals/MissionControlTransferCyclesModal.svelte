<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import { depositCycles } from '$lib/api/mission-control.api';
	import CanisterTransferCyclesModal from '$lib/components/modals/CanisterTransferCyclesModal.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
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
					missionControlId: $missionControlId!,
					identity: $authIdentity
				})
		);
</script>

{#if nonNullish($missionControlId)}
	<CanisterTransferCyclesModal
		{currentCycles}
		{onclose}
		segment={{
			segment: 'mission_control',
			canisterId: $missionControlId.toText(),
			label: $i18n.mission_control.title
		}}
		{transferFn}
	/>
{/if}
