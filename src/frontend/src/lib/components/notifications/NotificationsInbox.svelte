<script lang="ts">
	import NotificationsCanisterInfo from '$lib/components/notifications/NotificationsCanisterInfo.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		canisterNotifications: boolean;
		close: () => void;
	}

	let { canisterNotifications, close }: Props = $props();

	let noNotifications = $derived(!canisterNotifications);
</script>

{#if noNotifications}
	{$i18n.notifications.no_notifications}
{:else if canisterNotifications}
	<NotificationsCanisterInfo {close} />
{/if}
