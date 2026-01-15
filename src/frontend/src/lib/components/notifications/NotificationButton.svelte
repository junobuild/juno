<script lang="ts">
	import type { Snippet } from 'svelte';
	import Notification from '$lib/components/notifications/Notification.svelte';

	interface Props {
		onclick: () => void;
		icon: Snippet;
		badge?: Snippet;
		children: Snippet;
	}

	let { onclick, icon, badge, children }: Props = $props();
</script>

<button class="menu" {onclick}>
	<Notification {badge} {icon}>
		<span class="text">{@render children()}</span>
	</Notification>
</button>

<style lang="scss">
	@use '../../styles/mixins/text';

	.text {
		text-align: initial;

		@include text.clamp(3);
	}
</style>
