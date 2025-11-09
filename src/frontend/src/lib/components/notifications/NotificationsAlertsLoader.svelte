<script lang="ts">
	import NotificationsCanisterLoader from '$lib/components/notifications/NotificationsCanisterLoader.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
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
		canisterWarnings = $bindable(false)
	}: Props = $props();

	const hasWarnings = (warnings: CanisterWarning | undefined): boolean =>
		warnings?.cycles === true || warnings?.heap === true;

	let hasCanisterWarnings = $derived(
		hasWarnings(missionControlWarnings) ||
			hasWarnings(orbiterWarnings) ||
			hasWarnings(satelliteWarnings)
	);

	let hasUpgradeWarning = $derived($versionsLoaded && $versionsUpgradeWarning);

	let hasNotifications = $derived(hasCanisterWarnings || hasUpgradeWarning);

	$effect(() => {
		alerts = hasNotifications;
		upgradeWarning = hasUpgradeWarning;
		canisterWarnings = hasCanisterWarnings;
	});
</script>

<NotificationsCanisterLoader
	canisterId={$missionControlIdDerived}
	bind:warnings={missionControlWarnings}
	bind:data={missionControlCanisterData}
/>

<NotificationsCanisterLoader
	canisterId={$orbiterStore?.orbiter_id}
	bind:warnings={orbiterWarnings}
	bind:data={orbiterCanisterData}
/>

<NotificationsCanisterLoader
	canisterId={$satelliteStore?.satellite_id}
	bind:warnings={satelliteWarnings}
	bind:data={satelliteCanisterData}
/>
