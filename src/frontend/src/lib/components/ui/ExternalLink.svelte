<script lang="ts">
	export let href: string;
	export let ariaLabel = '';
</script>

<a
	{href}
	rel="external noopener noreferrer"
	target="_blank"
	aria-label={ariaLabel}
	title={ariaLabel}
>
	<slot />
</a>

<style lang="scss">
	a {
		display: inline-flex;
		align-items: center;
		gap: var(--padding-2x);

		text-decoration: none;

		:global(svg) {
			margin-left: var(--padding);
			vertical-align: bottom;
		}
	}
</style>
