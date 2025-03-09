<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import CanisterBuyCycleExpress from '$lib/components/canister/CanisterBuyCycleExpress.svelte';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import CanisterSyncData from '$lib/components/canister/CanisterSyncData.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		orbiter: Orbiter;
	}

	let { orbiter }: Props = $props();

	let monitoring = $derived(fromNullishNullable(fromNullishNullable(orbiter.settings)?.monitoring));

	let monitoringEnabled = $derived(fromNullishNullable(monitoring?.cycles)?.enabled === true);

	let canister = $state<CanisterSyncDataType | undefined>(undefined);

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	// eslint-disable-next-line require-await
	const onCanisterAction = async (type: 'delete_orbiter' | 'transfer_cycles_orbiter') => {
		close();

		// TODO: can be removed once the mission control is patched to disable monitoring on delete
		if (type === 'delete_orbiter' && monitoringEnabled) {
			toasts.warn($i18n.monitoring.warn_monitoring_enabled);
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type,
				detail: {
					cycles: canister?.data?.canister?.cycles ?? 0n
				}
			}
		});
	};
</script>

<CanisterSyncData canisterId={orbiter.orbiter_id} bind:canister />

<SegmentActions bind:visible segment="orbiter">
	{#snippet cycleActions()}
		<TopUp type="topup_orbiter" onclose={close} />

		<CanisterTransferCycles
			{canister}
			onclick={async () => await onCanisterAction('transfer_cycles_orbiter')}
		/>

		<CanisterBuyCycleExpress canisterId={orbiter.orbiter_id} />
	{/snippet}

	{#snippet canisterActions()}
		<CanisterStopStart
			{canister}
			{monitoringEnabled}
			segment="orbiter"
			onstop={close}
			onstart={close}
		/>

		<SegmentDetach
			segment="orbiter"
			segmentId={orbiter.orbiter_id}
			{monitoringEnabled}
			ondetach={close}
		/>

		<CanisterDelete {canister} onclick={async () => await onCanisterAction('delete_orbiter')} />
	{/snippet}
</SegmentActions>
