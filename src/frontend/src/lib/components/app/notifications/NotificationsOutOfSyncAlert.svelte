<script lang="ts">
	import NotificationButton from '$lib/components/app/notifications/NotificationButton.svelte';
	import IconSyncProblem from '$lib/components/icons/IconSyncProblem.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();

	const onclick = () => {
		close();

		emit({
			message: 'junoModal',
			detail: {
				type: 'reconcile_out_of_sync_segments'
			}
		});
	};
</script>

<NotificationButton {onclick}>
	{#snippet icon()}
		<IconSyncProblem size="32px" />
	{/snippet}

	{$i18n.notifications.out_of_sync}
</NotificationButton>
