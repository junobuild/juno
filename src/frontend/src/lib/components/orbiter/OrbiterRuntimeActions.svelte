<script lang="ts">
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import CanisterBuyCycleExpress from '$lib/components/canister/CanisterBuyCycleExpress.svelte';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		orbiter: Orbiter;
		canister: CanisterSyncDataType | undefined;
		monitoringEnabled: boolean;
	}

	let { orbiter, canister, monitoringEnabled }: Props = $props();

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

		// TODO: can be removed once the mission control is patched to disable monitoring on delete
		if (monitoringEnabled) {
			toasts.warn($i18n.monitoring.warn_monitoring_enabled);
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'delete_orbiter',
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

	{#snippet cyclesActions()}
		<CanisterTransferCycles {canister} onclick={onTransferCycles} />

		<CanisterBuyCycleExpress canisterId={orbiter.orbiter_id} />
	{/snippet}

	{#snippet lifecycleActions()}
		<CanisterStopStart
			{canister}
			{monitoringEnabled}
			segment="orbiter"
			onstop={close}
			onstart={close}
		/>

		<CanisterDelete {canister} onclick={onDeleteOrbiter} />
	{/snippet}
</SegmentActions>
