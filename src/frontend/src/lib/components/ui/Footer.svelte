<script lang="ts">
	import AppLang from '$lib/components/core/AppLang.svelte';
	import Theme from '$lib/components/ui/Theme.svelte';

	interface Props {
		themeToggle?: boolean;
		end?: 'lang' | 'none';
	}

	let { themeToggle = false, end = 'none' }: Props = $props();
</script>

<footer>
	<div class:theme={themeToggle} class="footer">
		{#if themeToggle}
			<Theme />
		{/if}

		{#if end === 'lang'}
			<AppLang />
		{/if}
	</div>
</footer>

<style lang="scss">
	@use '../../styles/mixins/media';

	footer {
		display: flex;
		justify-content: flex-end;

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
</style>
