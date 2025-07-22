<script lang="ts">
	import IconShield from '$lib/components/icons/IconShield.svelte';
	import Notification from '$lib/components/notifications/Notification.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { notificationPreferencesStore } from '$lib/stores/notification-preferences.store';
	import { setLocalStorageItem } from '$lib/utils/local-storage.utils';

	const dismiss = () => {
		notificationPreferencesStore.dismissFreezingThreshold();

		setLocalStorageItem({
			key: 'notification_preferences',
			value: JSON.stringify($notificationPreferencesStore)
		});
	};
</script>

<Notification>
	{#snippet icon()}
		<IconShield size="32px" />
	{/snippet}

	<div>
		<p>
			{$i18n.notifications.short_freezing_threshold}
		</p>

		<div class="toolbar">
			<a
				class="button"
				href="https://juno.build/docs/reference/settings#freezing-threshold"
				rel="noreferrer noopener"
				target="_blank">{$i18n.notifications.learn_more}</a
			>

			<button onclick={dismiss}>{$i18n.core.dismiss}</button>
		</div>
	</div>
</Notification>
