<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { debounce, isNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { MISSION_CONTROL_v0_0_14 } from '$lib/constants/version.constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterNotLoaded } from '$lib/derived/orbiter.derived';
	import { satellitesNotLoaded } from '$lib/derived/satellites.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import {
		initMonitoringWorker,
		type MonitoringWorker
	} from '$lib/services/workers/worker.monitoring.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSegment } from '$lib/types/canister';

	interface Props {
		children: Snippet;
		segments: CanisterSegment[];
	}

	let { children, segments }: Props = $props();

	let worker: MonitoringWorker | undefined = $state();

	onMount(async () => (worker = await initMonitoringWorker()));

	const debounceStart = debounce(() => {
		if (isNullish($missionControlIdDerived)) {
			return;
		}

		if (isNullish($missionControlVersion)) {
			return;
		}

		worker?.startMonitoringTimer({
			segments,
			missionControlId: $missionControlIdDerived,
			withMonitoringHistory:
				compare($missionControlVersion.current ?? '0.0.0', MISSION_CONTROL_v0_0_14) >= 0
		});
	});

	$effect(() => {
		worker?.stopMonitoringTimer();

		// We wait until mission control is loaded
		if (isNullish($missionControlIdDerived)) {
			return;
		}

		// We wait for the version for backwards compatibility because we only want to query the monitoring history for up-to-date mission control
		if (isNullish($missionControlVersion)) {
			return;
		}

		// Likewise for satellites
		if ($satellitesNotLoaded) {
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

	onDestroy(() => worker?.stopMonitoringTimer());

	const restartCycles = ({ detail: { canisterId: _ } }: CustomEvent<{ canisterId: Principal }>) => {
		if (segments.length === 0) {
			return;
		}

		if (isNullish($missionControlIdDerived)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		// TODO: we can potentially restart only the specified canister but, for now and simplicity reason, the worker just restart fully that's why we are passing all the segments.
		worker?.restartMonitoringTimer({
			segments,
			missionControlId: $missionControlIdDerived
		});
	};
</script>

<svelte:window onjunoRestartCycles={restartCycles} />

{@render children()}
