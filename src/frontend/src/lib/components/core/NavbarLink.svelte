<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		ariaLabel: string;
		children: Snippet;
	}

	let { href, ariaLabel, children }: Props = $props();
</script>

<a class="menu" {href} aria-label={ariaLabel}>
	{@render children()}
</a>

<style lang="scss">
	@use '../../styles/mixins/text';

	a.menu {
		display: flex;
		align-items: center;

		@include text.truncate;

		gap: var(--padding);

		font-size: var(--font-size-very-small);
		--canister-font-size: var(--font-size-very-small);

		background: var(--color-background);
		color: var(--color-background-contrast);

		border: 1px solid var(--text-color);

		:global(svg) {
			min-width: 24px;
			margin: 0 0 0 var(--padding-1_5x);
		}

		:global(svg + span) {
			margin: 0;
		}
	}
</style>
