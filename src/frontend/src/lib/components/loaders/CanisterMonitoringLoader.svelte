<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import { MISSION_CONTROL_v0_0_14 } from '$lib/constants/version.constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import {
		initMonitoringWorker,
		type MonitoringWorker
	} from '$lib/services/worker.monitoring.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type {
		CanisterMonitoringData,
		CanisterSyncMonitoring,
		Segment
	} from '$lib/types/canister';
	import type { PostMessageDataResponseCanister } from '$lib/types/post-message';

	interface Props {
		canisterId: Principal;
		segment: Segment;
		data: CanisterMonitoringData | undefined;
		children: Snippet;
	}

	let { canisterId, segment, data = $bindable(undefined), children }: Props = $props();

	const syncCanister = ({ canister }: PostMessageDataResponseCanister) => {
		const { data: d } = canister as CanisterSyncMonitoring;

		if (isNullish(d)) {
			return;
		}

		data = d;
	};

	let worker: MonitoringWorker | undefined = $state();

	onMount(async () => (worker = await initMonitoringWorker()));
	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		worker,
			canisterId,
			$missionControlIdDerived,
			$missionControlVersion,
			(() => {
				// We wait until mission control is loaded
				if (isNullish($missionControlIdDerived)) {
					return;
				}

				// We wait for the version for backwards compatibility because we only want to query the monitoring history for up-to-date mission control
				if (isNullish($missionControlVersion)) {
					return;
				}

				worker?.startMonitoringTimer({
					segments: [
						{
							canisterId: canisterId.toText(),
							segment
						}
					],
					missionControlId: $missionControlIdDerived,
					withMonitoringHistory:
						compare($missionControlVersion.current ?? '0.0.0', MISSION_CONTROL_v0_0_14) >= 0,
					callback: syncCanister
				});
			})();
	});

	onDestroy(() => worker?.stopMonitoringTimer());

	const restartCycles = ({
		detail: { canisterId: syncCanisterId }
	}: CustomEvent<{ canisterId: Principal }>) => {
		if (syncCanisterId.toText() !== canisterId.toText()) {
			return;
		}

		if (isNullish($missionControlIdDerived)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		worker?.restartMonitoringTimer({
			segments: [
				{
					canisterId: canisterId.toText(),
					segment
				}
			],
			missionControlId: $missionControlIdDerived
		});
	};
</script>

<svelte:window onjunoRestartCycles={restartCycles} />

{@render children()}
