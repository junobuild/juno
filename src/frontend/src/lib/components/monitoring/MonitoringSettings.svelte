<script lang="ts">
	import { fade } from 'svelte/transition';
	import MissionControlEmail from '$lib/components/mission-control/MissionControlEmail.svelte';
	import MonitoringDefaultStrategy from '$lib/components/monitoring/MonitoringDefaultStrategy.svelte';
	import MonitoringNotifications from '$lib/components/monitoring/MonitoringNotifications.svelte';
	import MonitoringStatus from '$lib/components/monitoring/MonitoringStatus.svelte';
	import {
		missionControlMonitored,
		missionControlSettingsLoaded
	} from '$lib/derived/mission-control-settings.derived';
	import { orbiterLoaded } from '$lib/derived/orbiter.derived';
	import { satellitesLoaded } from '$lib/derived/satellites.derived';
	import { openMonitoringModal } from '$lib/services/monitoring.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	const openModal = (type: 'create_monitoring_strategy' | 'stop_monitoring_strategy') => {
		openMonitoringModal({
			type,
			missionControlId
		});
	};

	const openCreateModal = () => openModal('create_monitoring_strategy');
	const openStopModal = () => openModal('stop_monitoring_strategy');

	let orbiterMonitored = $state(false);
	let hasSatellitesMonitored = $state(false);

	let monitored = $derived($missionControlMonitored || orbiterMonitored || hasSatellitesMonitored);
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.core.settings}</span>

	<div class="columns-3 fit-column-1 fit-column-2">
		<div>
			<MonitoringStatus />

			<MonitoringDefaultStrategy />
		</div>

		<div>
			<MonitoringNotifications />

			<MissionControlEmail />
		</div>
	</div>
</div>

{#if $missionControlSettingsLoaded && $satellitesLoaded && $orbiterLoaded}
	<div class="toolbar">
		<button onclick={openCreateModal} in:fade>
			{#if monitored}
				{$i18n.monitoring.update_auto_refill}
			{:else}
				{$i18n.core.get_started}
			{/if}
		</button>

		{#if monitored}
			<button onclick={openStopModal} in:fade>
				{$i18n.monitoring.stop_auto_refill}
			</button>
		{/if}
	</div>
{/if}
