<script lang="ts">
	import IconArrowOutward from '$lib/components/icons/IconArrowOutward.svelte';

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
	<span><slot /></span>

	<IconArrowOutward />
</a>

<style lang="scss">
	a {
		display: inline-flex;
		align-items: center;

		text-decoration: none;

		vertical-align: middle;

		:global(svg) {
			margin-left: var(--padding);
			vertical-align: middle;
		}
	}

	span {
		display: inline-flex;
		align-items: center;

		gap: var(--padding);
	}
</style>
