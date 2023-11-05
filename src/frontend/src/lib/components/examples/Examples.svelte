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
</script>

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

	<Resource href="https://juno.build/docs/miscellaneous/github_actions">
		<IconGitHub slot="icon" size="48px" />
		<svelte:fragment slot="title">GitHub</svelte:fragment>

		{$i18n.examples.tutorial_github_description}
	</Resource>
</section>

<h4>{$i18n.examples.examples}</h4>

<section>
	<Resource href="https://github.com/junobuild/examples/tree/main/next/diary">
		<IconNextJS slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_8_title}</svelte:fragment>

		{$i18n.examples.example_8_description}
	</Resource>

	<Resource href="https://github.com/junobuild/examples/blob/main/react/diary">
		<IconReact slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_2_title}</svelte:fragment>

		{$i18n.examples.example_2_description}
	</Resource>

	<Resource href="https://github.com/junobuild/examples/tree/main/svelte/form">
		<IconSvelte slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_1_title}</svelte:fragment>

		{$i18n.examples.example_1_description}
	</Resource>

	<Resource href="https://github.com/junobuild/examples/tree/main/vue/diary">
		<IconVue slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_7_title}</svelte:fragment>

		{$i18n.examples.example_7_description}
	</Resource>

	<Resource href="https://github.com/junobuild/examples/blob/main/angular/diary">
		<IconAngular slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_6_title}</svelte:fragment>

		{$i18n.examples.example_6_description}
	</Resource>

	<Resource href="https://github.com/junobuild/examples/tree/main/vanilla">
		<IconJavaScript slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_3_title}</svelte:fragment>

		{$i18n.examples.example_3_description}
	</Resource>

	<Resource href="https://github.com/junobuild/examples/blob/main/node/basic">
		<IconNodeJS slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_4_title}</svelte:fragment>

		{$i18n.examples.example_4_description}
	</Resource>

	<Resource href="https://github.com/junobuild/examples/blob/main/node/admin">
		<IconNodeJS slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_5_title}</svelte:fragment>

		{$i18n.examples.example_5_description}
	</Resource>
</section>

<style lang="scss">
	@use '../../styles/mixins/grid';
	@use '../../styles/mixins/button';

	h4 {
		margin: var(--padding-12x) 0 0;
	}

	section {
		@include grid.twelve-columns;

		padding: var(--padding-2x) 0;
	}
</style>
