<script lang="ts">
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import IconNotifications from '$lib/components/icons/IconNotifications.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';

	const onclick = () => {};
</script>

{#if $authSignedIn}
	<ButtonIcon {onclick}>
		{#snippet icon()}
			<IconNotifications size="16px" />
		{/snippet}
		Notifications
	</ButtonIcon>
{/if}
