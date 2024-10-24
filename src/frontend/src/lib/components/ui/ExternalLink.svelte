<script lang="ts">
	import IconArrowOutward from '$lib/components/icons/IconArrowOutward.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		ariaLabel?: string;
		underline?: boolean;
		children: Snippet;
	}

	let { href, ariaLabel = '', underline = false, children }: Props = $props();
</script>

<a
	{href}
	rel="external noopener noreferrer"
	target="_blank"
	aria-label={ariaLabel}
	title={ariaLabel}
	class:underline
>
	{@render children()}

	<IconArrowOutward />
</a>

<style lang="scss">
	a {
		display: inline-flex;
		align-items: center;
		gap: var(--padding-0_5x);

		&:not(.underline) {
			text-decoration: none;

			&:hover {
				text-decoration: none;
			}
		}

		:global(svg) {
			vertical-align: middle;
		}
	}
</style>
