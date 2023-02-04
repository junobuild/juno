<script lang="ts">
	export let href: string;
	export let alt = '';
</script>

<a {href} rel="external noopener noreferrer" target="_blank" {alt} title={alt}>
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
