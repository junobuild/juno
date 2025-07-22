<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import Notification from '$lib/components/notifications/Notification.svelte';

	interface Props {
		href: string;
		close: () => void;
		icon: Snippet;
		badge?: Snippet;
		children: Snippet;
	}

	let { href, close, icon, badge, children }: Props = $props();
</script>

<a {href} class="menu" onclick={close}>
	<Notification {icon} {badge}>
		<span class="text">{@render children()}</span>
	</Notification>
</a>

<style lang="scss">
	@use '../../styles/mixins/text';

	.text {
		@include text.clamp(3);
	}
</style>
