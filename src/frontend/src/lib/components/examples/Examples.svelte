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
</script>

<h4>Tutorials</h4>

<section>
	<Resource href="https://juno.build/blog/build-a-web3-app-with-react-js">
		<IconReact slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.tutorial_1_title}</svelte:fragment>

		{$i18n.examples.tutorial_1_description}
	</Resource>

	<Resource href="https://juno.build/blog/develop-an-angular-app-on-blockchain">
		<IconAngular slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.tutorial_2_title}</svelte:fragment>

		{$i18n.examples.tutorial_2_description}
	</Resource>

	<Resource href="https://juno.build/blog/build-a-web3-app-with-vuejs">
		<IconVue slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.tutorial_3_title}</svelte:fragment>

		{$i18n.examples.tutorial_3_description}
	</Resource>

	<Resource
		href="https://juno.build/blog/deploy-to-the-internet-computer-using-github-action-with-juno"
	>
		<IconGitHub slot="icon" size="48px" />
		<svelte:fragment slot="title">{$i18n.examples.tutorial_4_title}</svelte:fragment>

		{$i18n.examples.tutorial_4_description}
	</Resource>
</section>

<h4>Example projects</h4>

<section>
	<Resource href="https://github.com/buildwithjuno/examples/tree/main/svelte/form">
		<IconSvelte slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_1_title}</svelte:fragment>

		{$i18n.examples.example_1_description}
	</Resource>

	<Resource href="https://github.com/buildwithjuno/examples/blob/main/react/diary">
		<IconReact slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_2_title}</svelte:fragment>

		{$i18n.examples.example_2_description}
	</Resource>

	<Resource href="https://github.com/buildwithjuno/examples/blob/main/angular/diary">
		<IconAngular slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_6_title}</svelte:fragment>

		{$i18n.examples.example_6_description}
	</Resource>

	<Resource href="https://github.com/buildwithjuno/examples/tree/main/vue/diary">
		<IconVue slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_7_title}</svelte:fragment>

		{$i18n.examples.example_7_description}
	</Resource>

	<Resource href="https://github.com/buildwithjuno/examples/tree/main/vanilla">
		<IconJavaScript slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_3_title}</svelte:fragment>

		{$i18n.examples.example_3_description}
	</Resource>

	<Resource href="https://github.com/buildwithjuno/examples/tree/main/next/diary">
		<IconNextJS slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_8_title}</svelte:fragment>

		{$i18n.examples.example_8_description}
	</Resource>

	<Resource href="https://github.com/buildwithjuno/examples/blob/main/node/basic">
		<IconNodeJS slot="icon" />
		<svelte:fragment slot="title">{$i18n.examples.example_4_title}</svelte:fragment>

		{$i18n.examples.example_4_description}
	</Resource>

	<Resource href="https://github.com/buildwithjuno/examples/blob/main/node/admin">
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
