<script lang="ts">
	import IconGitHub from '$lib/components/icons/IconGitHub.svelte';
	import Theme from '$lib/components/ui/Theme.svelte';
	import IconTwitter from '$lib/components/icons/IconTwitter.svelte';
	import IconDiscord from '$lib/components/icons/IconDiscord.svelte';
	import AppLang from '$lib/components/core/AppLang.svelte';

	export let themeToggle = false;
	export let end: 'social' | 'lang' | 'none';
</script>

<footer>
	<div class:theme={themeToggle} class="footer">
		{#if themeToggle}
			<Theme />
		{/if}

		{#if end === 'social'}
			<div class="social">
				<a
					href="https://twitter.com/JunoBuild"
					rel="external noopener noreferrer"
					target="_blank"
					aria-label="GitHub"><IconTwitter /></a
				>

				<a
					href="https://github.com/junobuild/juno"
					rel="external noopener noreferrer"
					target="_blank"
					aria-label="GitHub"><IconGitHub /></a
				>

				<a
					href="https://discord.gg/wHZ57Z2RAG"
					rel="external noopener noreferrer"
					target="_blank"
					aria-label="Discord"><IconDiscord /></a
				>
			</div>
		{:else if end === 'lang'}
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
			padding: var(--padding-4x) var(--padding-6x) var(--padding-8x);
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
