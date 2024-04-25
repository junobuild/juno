<script lang="ts">
	import Resource from '$lib/components/examples/Resource.svelte';
	import IconReact from '$lib/components/icons/IconReact.svelte';
	import IconSvelte from '$lib/components/icons/IconSvelte.svelte';
	import IconJavaScript from '$lib/components/icons/IconJavaScript.svelte';
	import IconNodeJS from '$lib/components/icons/IconNodeJS.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import IconAngular from '$lib/components/icons/IconAngular.svelte';
	import IconVue from '$lib/components/icons/IconVue.svelte';
	import IconGitHub from '$lib/components/icons/IconGitHub.svelte';
	import IconNextJS from '$lib/components/icons/IconNextJS.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import IconAstro from '$lib/components/icons/IconAstro.svelte';
	import IconRust from '$lib/components/icons/IconRust.svelte';
	import IconDocker from '$lib/components/icons/IconDocker.svelte';
</script>

<hr />

<h4>{$i18n.examples.tutorials}</h4>

<section>
	<Resource href="https://juno.build/docs/guides/nextjs">
		<IconNextJS slot="icon" />
		<svelte:fragment slot="title">Next.js</svelte:fragment>

		{@html i18nFormat($i18n.examples.tutorial_framework_description, [
			{
				placeholder: '{0}',
				value: 'Next.js'
			}
		])}
	</Resource>

	<Resource href="https://juno.build/docs/guides/react">
		<IconReact slot="icon" />
		<svelte:fragment slot="title">React</svelte:fragment>

		{@html i18nFormat($i18n.examples.tutorial_framework_description, [
			{
				placeholder: '{0}',
				value: 'React'
			}
		])}
	</Resource>

	<Resource href="https://juno.build/docs/guides/sveltekit">
		<IconSvelte slot="icon" />
		<svelte:fragment slot="title">SvelteKit</svelte:fragment>

		{@html i18nFormat($i18n.examples.tutorial_framework_description, [
			{
				placeholder: '{0}',
				value: 'SvelteKit'
			}
		])}
	</Resource>

	<Resource href="https://juno.build/docs/guides/vue">
		<IconVue slot="icon" />
		<svelte:fragment slot="title">Vue</svelte:fragment>

		{@html i18nFormat($i18n.examples.tutorial_framework_description, [
			{
				placeholder: '{0}',
				value: 'Vue'
			}
		])}
	</Resource>

	<Resource href="https://juno.build/docs/guides/angular">
		<IconAngular slot="icon" />
		<svelte:fragment slot="title">Angular</svelte:fragment>

		{@html i18nFormat($i18n.examples.tutorial_framework_description, [
			{
				placeholder: '{0}',
				value: 'Angular'
			}
		])}
	</Resource>

	<Resource href="https://juno.build/docs/guides/astro">
		<IconAstro slot="icon" />
		<svelte:fragment slot="title">Astro</svelte:fragment>

		{@html i18nFormat($i18n.examples.tutorial_framework_description, [
			{
				placeholder: '{0}',
				value: 'Astro'
			}
		])}
	</Resource>

	<Resource href="https://juno.build/docs/guides/astro">
		<IconRust slot="icon" />
		<svelte:fragment slot="title">Rust</svelte:fragment>

		{@html i18nFormat($i18n.examples.tutorial_serverless_functions, [
			{
				placeholder: '{0}',
				value: 'Rust'
			}
		])}
	</Resource>

	<Resource href="https://juno.build/docs/miscellaneous/github_actions">
		<IconGitHub slot="icon" size="48px" />
		<svelte:fragment slot="title">GitHub</svelte:fragment>

		{$i18n.examples.tutorial_github_description}
	</Resource>

	<Resource href="https://juno.build/docs/miscellaneous/local-development">
		<IconDocker slot="icon" />
		<svelte:fragment slot="title">Docker</svelte:fragment>

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
