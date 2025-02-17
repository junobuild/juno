<script lang="ts">
	import AppLang from '$lib/components/core/AppLang.svelte';
	import SignInTroubleshooting from '$lib/components/core/SignInTroubleshooting.svelte';
	import Theme from '$lib/components/ui/Theme.svelte';

	interface Props {
		themeToggle?: boolean;
		end?: boolean;
	}

	let { themeToggle = false, end = false }: Props = $props();
</script>

<footer>
	<div class:theme={themeToggle} class="footer">
		{#if themeToggle}
			<Theme />
		{/if}

		{#if end}
			<div>
				<SignInTroubleshooting />

				<AppLang />
			</div>
		{/if}
	</div>
</footer>

<style lang="scss">
	@use '../../styles/mixins/media';

	footer {
		display: flex;
		justify-content: flex-end;

		height: calc(var(--footer-height) - var(--padding-4x));

		padding: var(--padding) var(--padding-2x);

		@include media.min-width(xlarge) {
			padding: var(--padding-4x) var(--padding-6x);
		}
	}

	.footer {
		display: flex;
		align-items: center;
	}

	.theme {
		display: flex;
		justify-content: space-between;

		width: 100%;
	}

	.social {
		padding: 0 var(--padding) 0 0;
	}

	div {
		display: flex;
		gap: var(--padding-2_5x);
		align-items: center;
	}
</style>
