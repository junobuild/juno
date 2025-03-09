<script lang="ts">
	import IconBook from '$lib/components/icons/IconBook.svelte';
	import { APP_VERSION } from '$lib/constants/app.constants';
</script>

<div>
	<a href="https://juno.build/docs/intro" rel="external noopener noreferrer" target="_blank"
		><IconBook /> Docs</a
	>
	/
	<a
		href={`https://juno.build/changelog/release-v${APP_VERSION}`}
		rel="external noopener noreferrer"
		target="_blank">v{APP_VERSION}</a
	>
</div>

<style lang="scss">
	div {
		display: inline-flex;
		gap: var(--padding-0_5x);
		font-size: var(--font-size-ultra-small);
		padding: var(--padding-2x) 0 calc(var(--padding-4x) - 2px);
	}

	a {
		display: inline-flex;
		text-decoration: none;
		gap: var(--padding-0_5x);

		&:hover,
		&:focus {
			text-decoration: none;
			color: var(--text-color);
			font-weight: var(--font-weight-bold);
		}
	}
</style>
