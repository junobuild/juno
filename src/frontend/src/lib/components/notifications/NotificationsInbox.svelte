<script lang="ts">
	import NotificationsCanisterInfo from '$lib/components/notifications/NotificationsCanisterInfo.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { slide } from 'svelte/transition';
	import { circOut } from 'svelte/easing';

	interface Props {
		canisterNotifications: boolean;
	}

	let { canisterNotifications }: Props = $props();

	let noNotifications = $derived(!canisterNotifications);
</script>

{#if noNotifications}
	{$i18n.notifications.no_notifications}
{:else if canisterNotifications}
	<div out:slide={{ delay: 0, duration: 100, easing: circOut, axis: 'y' }}>
		<NotificationsCanisterInfo />
	</div>
{/if}
