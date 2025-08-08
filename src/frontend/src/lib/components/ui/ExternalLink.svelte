<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconArrowOutward from '$lib/components/icons/IconArrowOutward.svelte';
	import type { TestId } from '$lib/types/test-id';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		href: string;
		ariaLabel?: string;
		underline?: boolean;
		arrow?: boolean;
		testId?: TestId;
		children: Snippet;
	}

	let {
		href,
		ariaLabel = '',
		underline = false,
		arrow = true,
		children,
		testId: testIdProp
	}: Props = $props();
</script>

<a
	class:underline
	aria-label={ariaLabel}
	data-tid={testId(testIdProp)}
	{href}
	rel="external noopener noreferrer"
	target="_blank"
	title={ariaLabel}
>
	{@render children()}

	{#if arrow}
		<IconArrowOutward />
	{/if}
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
