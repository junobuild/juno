<script lang="ts">
	import CanisterTransferCycles from '$lib/components/canister/cycles/CanisterTransferCycles.svelte';
	import CanisterDelete from '$lib/components/canister/lifecycle/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/lifecycle/CanisterStopStart.svelte';
	import TopUp from '$lib/components/canister/top-up/TopUp.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		canister: CanisterSyncDataType | undefined;
		monitoringEnabled: boolean;
	}

	let { canister, monitoringEnabled }: Props = $props();

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

	// eslint-disable-next-line require-await
	const onDeleteOrbiter = async () => {
		close();

		emit({
			message: 'junoModal',
			detail: {
				type: 'delete_orbiter',
				detail: {
					cycles: canister?.data?.canister?.cycles ?? 0n,
					monitoringEnabled
				}
			}
		});
	};
</script>

<SegmentActions bind:visible>
	{#snippet mainActions()}
		<TopUp onclose={close} type="topup_orbiter" />
	{/snippet}

	{#snippet cyclesActions()}
		<CanisterTransferCycles {canister} onclick={onTransferCycles} />
	{/snippet}

	{#snippet lifecycleActions()}
		<CanisterStopStart
			{canister}
			{monitoringEnabled}
			onstart={close}
			onstop={close}
			segment="orbiter"
		/>

		<CanisterDelete {canister} onclick={onDeleteOrbiter} />
	{/snippet}
</SegmentActions>
