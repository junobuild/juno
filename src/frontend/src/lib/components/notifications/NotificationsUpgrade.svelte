<script lang="ts">
	import IconUpgradeDock from '$lib/components/icons/IconUpgradeDock.svelte';
	import Notification from '$lib/components/notifications/Notification.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { upgradeDockLink } from '$lib/utils/nav.utils';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();
</script>

<Notification href={upgradeDockLink($satelliteStore?.satellite_id)} {close}>
	{#snippet icon()}
		<IconUpgradeDock size="32px" />
	{/snippet}

	{$i18n.notifications.upgrade_available}
</Notification>
