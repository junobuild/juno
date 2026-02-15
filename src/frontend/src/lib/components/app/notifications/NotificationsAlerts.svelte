<script lang="ts">
	import NotificationsCanisterAlert from '$lib/components/app/notifications/NotificationsCanisterAlert.svelte';
	import NotificationsOutOfSyncAlert from '$lib/components/app/notifications/NotificationsOutOfSyncAlert.svelte';
	import NotificationsUpgrade from '$lib/components/app/notifications/NotificationsUpgrade.svelte';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { satellite } from '$lib/derived/satellite.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
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
		outOfSyncWarnings: boolean;
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
		canisterWarnings,
		outOfSyncWarnings
	}: Props = $props();

	let noAlerts = $derived(!alerts);
</script>

{#snippet warnings()}
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
			href={overviewLink($satellite?.satellite_id)}
			segment="satellite"
			warnings={satelliteWarnings}
		/>
	{/if}

	{#if outOfSyncWarnings}
		<NotificationsOutOfSyncAlert {close} />
	{/if}

	{#if upgradeWarning}
		<NotificationsUpgrade {close} />
	{/if}
{/snippet}

{#if noAlerts}
	{$i18n.notifications.no_alerts}
{:else}
	{@render warnings()}
{/if}
