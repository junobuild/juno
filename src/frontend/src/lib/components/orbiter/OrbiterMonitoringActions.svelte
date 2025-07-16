<script lang="ts">
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import CanisterBuyCycleExpress from '$lib/components/canister/CanisterBuyCycleExpress.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		orbiter: Orbiter;
		canister: CanisterSyncDataType | undefined;
	}

	let { orbiter, canister }: Props = $props();

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	// eslint-disable-next-line require-await
	const onTransferCycles = async () => {
		close();

		emit({
			message: 'junoModal',
			detail: {
				type: 'transfer_cycles_orbiter',
				detail: {
					cycles: canister?.data?.canister?.cycles ?? 0n
				}
			}
		});
	};
</script>

<SegmentActions bind:visible>
	{#snippet mainActions()}
		<TopUp type="topup_orbiter" onclose={close} />
	{/snippet}

	{#snippet moreActions()}
		<CanisterTransferCycles {canister} onclick={onTransferCycles} />

		<CanisterBuyCycleExpress canisterId={orbiter.orbiter_id} />
	{/snippet}
</SegmentActions>
