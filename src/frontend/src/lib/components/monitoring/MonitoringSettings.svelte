<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import MissionControlSettingsLoader from '$lib/components/mission-control/MissionControlSettingsLoader.svelte';
	import MonitoringSettingsMissionControl from '$lib/components/monitoring/MonitoringSettingsMissionControl.svelte';
	import MonitoringSettingsOrbiter from '$lib/components/monitoring/MonitoringSettingsOrbiter.svelte';
	import MonitoringSettingsSatellites from '$lib/components/monitoring/MonitoringSettingsSatellites.svelte';
	import { missionControlSettingsLoaded } from '$lib/derived/mission-control.derived';
	import { orbiterLoaded } from '$lib/derived/orbiter.derived';
	import { satellitesLoaded } from '$lib/derived/satellite.derived';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlSettingsDataStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		missionControlId: Principal;
	}

	let { missionControlId }: Props = $props();

	const openModal = () => {
		if (isNullish($missionControlSettingsDataStore)) {
			toasts.error({ text: $i18n.errors.mission_control_settings_not_loaded });
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'monitoring_create_bulk_strategy',
				detail: {
					settings: $missionControlSettingsDataStore.data,
					missionControlId
				}
			}
		});
	};

	onMount(async () => await loadOrbiters({ missionControl: missionControlId }));

	let missionControlMonitored = $state(false);
	let orbiterMonitored = $state(false);
	let satellitesMonitored = $state(false);
</script>

<MissionControlSettingsLoader {missionControlId}>
	<div class="card-container with-title">
		<span class="title">{$i18n.core.settings}</span>

		<div class="columns-3 fit-column-1">
			<div>
				<MonitoringSettingsMissionControl bind:missionControlMonitored />

				<MonitoringSettingsSatellites bind:hasSatellitesMonitored={satellitesMonitored} />

				<MonitoringSettingsOrbiter bind:orbiterMonitored />
			</div>
		</div>
	</div>

	{#if $missionControlSettingsLoaded && $satellitesLoaded && $orbiterLoaded}
		<button in:fade onclick={openModal}>
			{#if missionControlMonitored || satellitesMonitored || orbiterMonitored}
				{$i18n.monitoring.create_strategy}
			{:else}
				{$i18n.monitoring.start_monitoring}
			{/if}
		</button>
	{/if}
</MissionControlSettingsLoader>
