<script lang="ts">
	import IconUpgradeDock from '$lib/components/icons/IconUpgradeDock.svelte';
	import Notification from '$lib/components/notifications/Notification.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import {
		missionControlVersion,
		orbiterVersion,
		satellitesVersion,
		versionsLoaded
	} from '$lib/derived/version.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { upgradeDockLink } from '$lib/utils/nav.utils';

	let hasPendingUpgrade = $derived(
		$missionControlVersion?.warning === true ||
			$orbiterVersion?.warning === true ||
			Object.values($satellitesVersion).find((version) => version?.warning === true) !== undefined
	);
</script>

{#if $versionsLoaded && hasPendingUpgrade}
	<Notification href={upgradeDockLink($satelliteStore?.satellite_id)} {close}>
		{#snippet icon()}
			<IconUpgradeDock size="32px" />
		{/snippet}

		{$i18n.notifications.upgrade_available}
	</Notification>
{/if}
