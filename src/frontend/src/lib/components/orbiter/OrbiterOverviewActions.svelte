<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		orbiter: Orbiter;
		canister: CanisterSyncDataType | undefined;
	}

	let { orbiter, canister }: Props = $props();

	let monitoring = $derived(fromNullishNullable(fromNullishNullable(orbiter.settings)?.monitoring));

	let monitoringEnabled = $derived(fromNullishNullable(monitoring?.cycles)?.enabled === true);

	let visible: boolean = $state(false);
	const close = () => (visible = false);

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
	{#snippet moreActions()}
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

		<CanisterDelete {canister} onclick={onDeleteOrbiter} />
	{/snippet}
</SegmentActions>
