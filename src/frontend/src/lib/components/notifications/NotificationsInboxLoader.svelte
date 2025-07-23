<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { notificationFreezingThresholdEnabled } from '$lib/derived/notification-preferences.derived';
	import { orbiterWithSyncData } from '$lib/derived/orbiter-merged.derived';
	import { satellitesWithSyncData } from '$lib/derived/satellites-merged.derived';
	import type { CanisterData } from '$lib/types/canister';

	interface Props {
		missionControlCanisterData: CanisterData | undefined;
		canisterNotifications: boolean;
	}

	let { missionControlCanisterData, canisterNotifications = $bindable(false) }: Props = $props();

	const hasFreezingThresholdWarnings = (data: CanisterData | undefined): boolean =>
		data?.canister.status === 'running' && data?.warning.freezingThreshold === true;

	let missionControlWarnings = $derived(hasFreezingThresholdWarnings(missionControlCanisterData));

	let satelliteWarnings = $derived(
		$satellitesWithSyncData.find(({ canister: { data } }) => hasFreezingThresholdWarnings(data)) !==
			undefined
	);

	let orbiterWarnings = $derived(
		(nonNullish($orbiterWithSyncData) ? [$orbiterWithSyncData] : []).find(
			({ canister: { data } }) => hasFreezingThresholdWarnings(data)
		) !== undefined
	);

	let hasCanisterNotifications = $derived(
		missionControlWarnings || orbiterWarnings || satelliteWarnings
	);

	let hasNotifications = $derived(hasCanisterNotifications);

	$effect(() => {
		canisterNotifications = hasNotifications && $notificationFreezingThresholdEnabled;
	});
</script>
