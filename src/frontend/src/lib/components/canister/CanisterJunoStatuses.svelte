<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { CanisterJunoStatus, Segment } from '$lib/types/canister';
	import type { PostMessageDataResponse } from '$lib/types/post-message';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { initStatusesWorker, type StatusesWorker } from '$lib/services/worker.statuses.services';
	import { isNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';

	export let canisterId: Principal;
	export let segment: Segment;

	const dispatch = createEventDispatcher();

	const syncCanister = ({ canister }: PostMessageDataResponse) => {
		const { data } = canister as CanisterJunoStatus;

		if (isNullish(data)) {
			return;
		}

		const { chartsData } = data;

		dispatch('junoStatuses', chartsData);
	};

	let worker: StatusesWorker | undefined;

	onMount(async () => (worker = await initStatusesWorker()));
	$: worker,
		canisterId,
		$missionControlStore,
		(() => {
			// We wait until mission control is loaded
			if (isNullish($missionControlStore)) {
				return;
			}

			worker?.startStatusesTimer({
				segments: [
					{
						canisterId: canisterId.toText(),
						segment
					}
				],
				missionControlId: $missionControlStore,
				callback: syncCanister
			});
		})();

	onDestroy(() => worker?.stopStatusesTimer());

	const restartCycles = ({
		detail: { canisterId: syncCanisterId }
	}: CustomEvent<{ canisterId: Principal }>) => {
		if (syncCanisterId.toText() !== canisterId.toText()) {
			return;
		}

		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		worker?.restartStatusesTimer({
			segments: [
				{
					canisterId: canisterId.toText(),
					segment
				}
			],
			missionControlId: $missionControlStore
		});
	};
</script>

<svelte:window on:junoRestartCycles={restartCycles} />

<slot />
