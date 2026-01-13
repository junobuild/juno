<script lang="ts">
	import IconUpgradeDock from '$lib/components/icons/IconUpgradeDock.svelte';
	import NotificationLink from '$lib/components/notifications/NotificationLink.svelte';
	import { satellite } from '$lib/derived/satellite.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { upgradeDockLink } from '$lib/utils/nav.utils';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();
</script>

<NotificationLink {close} href={upgradeDockLink($satellite?.satellite_id)}>
	{#snippet icon()}
		<IconUpgradeDock size="32px" />
	{/snippet}

	{$i18n.notifications.upgrade_available}
</NotificationLink>
