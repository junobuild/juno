<script lang="ts">
	import { debounce, isNullish } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import { compare } from 'semver';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { MISSION_CONTROL_v0_0_14 } from '$lib/constants/version.constants';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { mctrlSatellitesNotLoaded } from '$lib/derived/mission-control/mission-control-satellites.derived';
	import { orbiterNotLoaded } from '$lib/derived/orbiter.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { MonitoringWorker } from '$lib/services/workers/worker.monitoring.services';
	import type { CanisterSegment } from '$lib/types/canister';

	interface Props {
		children: Snippet;
		segments: CanisterSegment[];
	}

	let { children, segments }: Props = $props();

	let worker = $state<MonitoringWorker | undefined>();

	onMount(async () => (worker = await MonitoringWorker.init()));
	onDestroy(() => worker?.terminate());

	const debounceStart = debounce(() => {
		if (isNullish($missionControlId)) {
			return;
		}

		if (isNullish($missionControlVersion)) {
			return;
		}

		worker?.startMonitoringTimer({
			segments,
			missionControlId: $missionControlId,
			withMonitoringHistory:
				compare($missionControlVersion.current ?? '0.0.0', MISSION_CONTROL_v0_0_14) >= 0
		});
	});

	$effect(() => {
		worker?.stopMonitoringTimer();

		// We wait until mission control is loaded
		if (isNullish($missionControlId)) {
			return;
		}

		// We wait for the version for backwards compatibility because we only want to query the monitoring history for up-to-date mission control
		if (isNullish($missionControlVersion)) {
			return;
		}

		// Likewise for satellites
		if ($mctrlSatellitesNotLoaded) {
			return;
		}

		// And orbiter
		if ($orbiterNotLoaded) {
			return;
		}

		// This way we now the list of segments is derived completely
		if (segments.length === 0) {
			return;
		}

		debounceStart();
	});

	const restartCycles = ({ detail: { canisterId: _ } }: CustomEvent<{ canisterId: Principal }>) => {
		if (segments.length === 0) {
			return;
		}

		if (isNullish($missionControlId)) {
			return;
		}

		// TODO: we can potentially restart only the specified canister but, for now and simplicity reason, the worker just restart fully that's why we are passing all the segments.
		worker?.restartMonitoringTimer({
			segments,
			missionControlId: $missionControlId
		});
	};
</script>

<svelte:window onjunoRestartCycles={restartCycles} />

{@render children()}
