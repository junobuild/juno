<script lang="ts">
	import Resource from '$lib/components/examples/Resource.svelte';
	import IconAngular from '$lib/components/icons/IconAngular.svelte';
	import IconAstro from '$lib/components/icons/IconAstro.svelte';
	import IconDocker from '$lib/components/icons/IconDocker.svelte';
	import IconGitHub from '$lib/components/icons/IconGitHub.svelte';
	import IconNextJS from '$lib/components/icons/IconNextJS.svelte';
	import IconReact from '$lib/components/icons/IconReact.svelte';
	import IconRust from '$lib/components/icons/IconRust.svelte';
	import IconSvelte from '$lib/components/icons/IconSvelte.svelte';
	import IconTypeScript from '$lib/components/icons/IconTypeScript.svelte';
	import IconVue from '$lib/components/icons/IconVue.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
</script>

<hr />

<h4>{$i18n.examples.tutorials}</h4>

<section>
	<Resource href="https://juno.build/docs/guides/nextjs">
		{#snippet icon()}
			<IconNextJS />
		{/snippet}
		{#snippet title()}
			Next.js
		{/snippet}

		<Html
			text={i18nFormat($i18n.examples.tutorial_framework_description, [
				{
					placeholder: '{0}',
					value: 'Next.js'
				}
			])}
		/>
	</Resource>

	<Resource href="https://juno.build/docs/guides/react">
		{#snippet icon()}
			<IconReact />
		{/snippet}
		{#snippet title()}
			React
		{/snippet}

		<Html
			text={i18nFormat($i18n.examples.tutorial_framework_description, [
				{
					placeholder: '{0}',
					value: 'React'
				}
			])}
		/>
	</Resource>

	<Resource href="https://juno.build/docs/guides/sveltekit">
		{#snippet icon()}
			<IconSvelte />
		{/snippet}
		{#snippet title()}
			SvelteKit
		{/snippet}

		<Html
			text={i18nFormat($i18n.examples.tutorial_framework_description, [
				{
					placeholder: '{0}',
					value: 'SvelteKit'
				}
			])}
		/>
	</Resource>

	<Resource href="https://juno.build/docs/guides/vue">
		{#snippet icon()}
			<IconVue />
		{/snippet}
		{#snippet title()}
			Vue
		{/snippet}

		<Html
			text={i18nFormat($i18n.examples.tutorial_framework_description, [
				{
					placeholder: '{0}',
					value: 'Vue'
				}
			])}
		/>
	</Resource>

	<Resource href="https://juno.build/docs/guides/angular">
		{#snippet icon()}
			<IconAngular />
		{/snippet}
		{#snippet title()}
			Angular
		{/snippet}

		<Html
			text={i18nFormat($i18n.examples.tutorial_framework_description, [
				{
					placeholder: '{0}',
					value: 'Angular'
				}
			])}
		/>
	</Resource>

	<Resource href="https://juno.build/docs/guides/astro">
		{#snippet icon()}
			<IconAstro />
		{/snippet}
		{#snippet title()}
			Astro
		{/snippet}

		<Html
			text={i18nFormat($i18n.examples.tutorial_framework_description, [
				{
					placeholder: '{0}',
					value: 'Astro'
				}
			])}
		/>
	</Resource>

	<Resource href="https://juno.build/docs/guides/rust">
		{#snippet icon()}
			<IconRust />
		{/snippet}
		{#snippet title()}
			Rust
		{/snippet}

		<Html
			text={i18nFormat($i18n.examples.tutorial_serverless_functions, [
				{
					placeholder: '{0}',
					value: 'Rust'
				}
			])}
		/>
	</Resource>

	<Resource href="https://juno.build/docs/guides/typescript">
		{#snippet icon()}
			<IconTypeScript />
		{/snippet}
		{#snippet title()}
			TypeScript
		{/snippet}

		<Html
			text={i18nFormat($i18n.examples.tutorial_serverless_functions, [
				{
					placeholder: '{0}',
					value: 'TypeScript'
				}
			])}
		/>
	</Resource>

	<Resource href="https://juno.build/docs/guides/github-actions">
		{#snippet icon()}
			<IconGitHub size="48px" />
		{/snippet}
		{#snippet title()}
			GitHub
		{/snippet}

		{$i18n.examples.tutorial_github_description}
	</Resource>

	<Resource href="https://juno.build/docs/guides/local-development">
		{#snippet icon()}
			<IconDocker />
		{/snippet}
		{#snippet title()}
			Docker
		{/snippet}

		{$i18n.examples.tutorial_docker_description}
	</Resource>
</section>

<style lang="scss">
	@use '../../styles/mixins/grid';
	@use '../../styles/mixins/button';

	hr {
		margin: var(--padding-8x) 0 0;
	}

	h4 {
		margin: var(--padding-8x) 0 0;
	}

	section {
		@include grid.twelve-columns;

		padding: var(--padding-2x) 0;
	}
</style>
