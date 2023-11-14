<script lang="ts">
	import IconArrowOutward from '$lib/components/icons/IconArrowOutward.svelte';

	export let href: string;
	export let ariaLabel = '';
	export let underline = false;
</script>

<a
	{href}
	rel="external noopener noreferrer"
	target="_blank"
	aria-label={ariaLabel}
	title={ariaLabel}
	class:underline
>
	<slot />

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
