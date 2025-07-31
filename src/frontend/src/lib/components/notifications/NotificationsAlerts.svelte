<script lang="ts">
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import NotificationsCanisterAlert from '$lib/components/notifications/NotificationsCanisterAlert.svelte';
	import NotificationsUpgrade from '$lib/components/notifications/NotificationsUpgrade.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterWarning } from '$lib/types/canister';
	import { overviewLink } from '$lib/utils/nav.utils';

	interface Props {
		missionControlCanisterData: CanisterData | undefined;
		missionControlWarnings: CanisterWarning | undefined;
		orbiterCanisterData: CanisterData | undefined;
		orbiterWarnings: CanisterWarning | undefined;
		satelliteCanisterData: CanisterData | undefined;
		satelliteWarnings: CanisterWarning | undefined;
		close: () => void;
		alerts: boolean;
		upgradeWarning: boolean;
		canisterWarnings: boolean;
	}

	let {
		missionControlCanisterData,
		missionControlWarnings,
		orbiterCanisterData,
		orbiterWarnings,
		satelliteCanisterData,
		satelliteWarnings,
		close,
		alerts,
		upgradeWarning,
		canisterWarnings
	}: Props = $props();

	let noAlerts = $derived(!alerts);
</script>

{#if noAlerts}
	{$i18n.notifications.no_alerts}
{:else}
	{#if canisterWarnings}
		<NotificationsCanisterAlert
			{close}
			cyclesIcon={IconMissionControl}
			data={missionControlCanisterData}
			href="/mission-control"
			segment="mission_control"
			warnings={missionControlWarnings}
		/>

		<NotificationsCanisterAlert
			{close}
			cyclesIcon={IconAnalytics}
			data={orbiterCanisterData}
			href="/analytics/?tab=overview"
			segment="orbiter"
			warnings={orbiterWarnings}
		/>

		<NotificationsCanisterAlert
			{close}
			cyclesIcon={IconSatellite}
			data={satelliteCanisterData}
			href={overviewLink($satelliteStore?.satellite_id)}
			segment="satellite"
			warnings={satelliteWarnings}
		/>
	{/if}

	{#if upgradeWarning}
		<NotificationsUpgrade {close} />
	{/if}
{/if}
