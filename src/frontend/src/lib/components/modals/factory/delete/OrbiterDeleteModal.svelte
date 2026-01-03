<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { deleteOrbiter } from '$lib/api/mission-control.api';
	import FactoryDeleteWizard from '$lib/components/factory/delete/FactoryDeleteWizard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import type { MissionControlId } from '$lib/types/mission-control';
	import type { JunoModalCycles, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { cycles: currentCycles } = $derived(detail as JunoModalCycles);

	let deleteFn: (params: {
		missionControlId: MissionControlId;
		cyclesToDeposit: bigint;
	}) => Promise<void> = $derived(
		async (params: { missionControlId: MissionControlId; cyclesToDeposit: bigint }) =>
			await deleteOrbiter({
				...params,
				// TODO: resolve no-non-null-assertion
				// We know for sure that the orbiter is defined at this point.
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				orbiterId: $orbiterStore!.orbiter_id,
				identity: $authIdentity
			})
	);
</script>

{#if nonNullish($orbiterStore)}
	<Modal {onclose}>
		<FactoryDeleteWizard {currentCycles} {deleteFn} {onclose} segment="analytics" />
	</Modal>
{/if}
