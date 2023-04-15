<script lang="ts">
	import Example from '$lib/components/examples/Example.svelte';
	import IconReact from '$lib/components/icons/IconReact.svelte';
	import IconSvelte from '$lib/components/icons/IconSvelte.svelte';
	import IconJavaScript from '$lib/components/icons/IconJavaScript.svelte';
	import IconNodeJS from '$lib/components/icons/IconNodeJS.svelte';
</script>

<h4>Tutorials</h4>

<section>
	<Example href="https://juno.build/blog/build-a-web3-app-with-react-js">
		<IconReact slot="icon" />
		<svelte:fragment slot="title">Build A Web3 App With React JS</svelte:fragment>

		How to develop a decentralized application on blockchain with React and Juno.
	</Example>
</section>

<h4>Example projects</h4>

<section>
	<Example href="https://github.com/buildwithjuno/examples/tree/main/svelte/form">
		<IconSvelte slot="icon" />
		<svelte:fragment slot="title">Svelte example</svelte:fragment>

		A sample app that uses Juno datastore and authentication.
	</Example>

	<Example href="https://github.com/buildwithjuno/examples/blob/main/react/diary">
		<IconReact slot="icon" />
		<svelte:fragment slot="title">React example</svelte:fragment>

		An example application that uses Juno datastore, storage and authentication.
	</Example>

	<Example href="https://github.com/buildwithjuno/examples/tree/main/vanilla">
		<IconJavaScript slot="icon" />
		<svelte:fragment slot="title">Vanilla-js example</svelte:fragment>

		A demonstration dapp in vanilla Javascript that showcases authentication, datastore and storage
		usage.
	</Example>

	<Example href="https://github.com/buildwithjuno/examples/blob/main/node/basic">
		<IconNodeJS slot="icon" />
		<svelte:fragment slot="title">NodeJS basic example</svelte:fragment>

		A simple script that performs a get.
	</Example>

	<Example href="https://github.com/buildwithjuno/examples/blob/main/node/admin">
		<IconNodeJS slot="icon" />
		<svelte:fragment slot="title">NodeJS admin example</svelte:fragment>

		An admin script to set documents in the datastore.
	</Example>
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
