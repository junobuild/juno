<script lang="ts">
	import AppLang from '$lib/components/core/AppLang.svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Theme from '$lib/components/ui/Theme.svelte';
</script>

<footer>
	<Theme />

	<div class="end">
		<div class="links">
			<ExternalLink arrow={false} href="https://juno.build/docs/intro">Docs</ExternalLink>

			<ExternalLink arrow={false} href="https://juno.build/docs/category/guides-and-examples"
				>Guides</ExternalLink
			>

			<ExternalLink arrow={false} href="https://github.com/junobuild/juno">GitHub</ExternalLink>

			<ExternalLink arrow={false} href="https://discord.gg/wHZ57Z2RAG">Discord</ExternalLink>
		</div>

		<AppLang />
	</div>
</footer>

<style lang="scss">
	@use '../../styles/mixins/media';

	footer {
		padding: var(--padding-3x) var(--padding-2x) 0;

		border-top: 1px solid var(--text-color);

		@include media.min-width(xlarge) {
			padding: var(--padding-4x) var(--padding-6x) 0;
		}
	}

	.end {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.links {
		gap: var(--padding-2x);
		padding: var(--padding-2x) 0;

		font-size: var(--font-size-very-small);
	}
</style>
