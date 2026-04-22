<script lang="ts">
	import NotificationsCanisterLoader from '$lib/components/app/notifications/NotificationsCanisterLoader.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { orbiter } from '$lib/derived/orbiter.derived';
	import { outOfSyncOrbiters, outOfSyncSatellites } from '$lib/derived/out-of-sync.derived';
	import { satellite } from '$lib/derived/satellite.derived';
	import { versionsLoaded, versionsUpgradeWarning } from '$lib/derived/version.derived';
	import type { CanisterData, CanisterWarning } from '$lib/types/canister';

	interface Props {
		missionControlCanisterData: CanisterData | undefined;
		missionControlWarnings: CanisterWarning | undefined;
		orbiterCanisterData: CanisterData | undefined;
		orbiterWarnings: CanisterWarning | undefined;
		satelliteCanisterData: CanisterData | undefined;
		satelliteWarnings: CanisterWarning | undefined;
		alerts: boolean;
		upgradeWarning: boolean;
		canisterWarnings: boolean;
		outOfSyncWarnings: boolean;
	}

	let {
		missionControlCanisterData = $bindable(undefined),
		missionControlWarnings = $bindable(undefined),
		orbiterCanisterData = $bindable(undefined),
		orbiterWarnings = $bindable(undefined),
		satelliteCanisterData = $bindable(undefined),
		satelliteWarnings = $bindable(undefined),
		alerts = $bindable(false),
		upgradeWarning = $bindable(false),
		canisterWarnings = $bindable(false),
		outOfSyncWarnings = $bindable(false)
	}: Props = $props();

	const hasWarnings = (warnings: CanisterWarning | undefined): boolean =>
		warnings?.cycles === true || warnings?.heap === true;

	let hasCanisterWarnings = $derived(
		hasWarnings(missionControlWarnings) ||
			hasWarnings(orbiterWarnings) ||
			hasWarnings(satelliteWarnings)
	);

	let hasUpgradeWarning = $derived($versionsLoaded && $versionsUpgradeWarning);

	let hasOutOfSyncWarning = $derived($outOfSyncSatellites === true || $outOfSyncOrbiters === true);

	let hasNotifications = $derived(hasCanisterWarnings || hasUpgradeWarning || hasOutOfSyncWarning);

	$effect(() => {
		alerts = hasNotifications;
		upgradeWarning = hasUpgradeWarning;
		canisterWarnings = hasCanisterWarnings;
		outOfSyncWarnings = hasOutOfSyncWarning;
	});
</script>

<NotificationsCanisterLoader
	canisterId={$missionControlId}
	bind:warnings={missionControlWarnings}
	bind:data={missionControlCanisterData}
/>

<NotificationsCanisterLoader
	canisterId={$orbiter?.orbiter_id}
	bind:warnings={orbiterWarnings}
	bind:data={orbiterCanisterData}
/>

<NotificationsCanisterLoader
	canisterId={$satellite?.satellite_id}
	bind:warnings={satelliteWarnings}
	bind:data={satelliteCanisterData}
/>
