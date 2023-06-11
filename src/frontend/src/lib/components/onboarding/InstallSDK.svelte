<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { i18n } from '$lib/stores/i18n.store';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Code from '$lib/components/ui/Code.svelte';
	import { createEventDispatcher } from 'svelte';

	export let satellite: Satellite | undefined;

	const codeInit = `import { initJuno } from "@junobuild/core";

await initJuno({
    satelliteId: "${satellite?.satellite_id.toText() ?? ''}",
});`;

	const dispatch = createEventDispatcher();
</script>

<h2>{$i18n.on_boarding.install}</h2>

<p>{$i18n.on_boarding.connect}</p>

<p>
	If you're already using <ExternalLink href="https://www.npmjs.com/">npm</ExternalLink>, you can
	run the following command to install the latest SDK:
</p>

<Code code={`npm i @junobuild/core`} language="bash" />

<p class="then">
	Then, initialize Juno with your satellite ID and begin using the SDKs for any features you'd like
	to use.
</p>

<Code code={codeInit} />

<button on:click={() => dispatch('junoContinue')}>{$i18n.core.continue}</button>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	h2 {
		@include overlay.title;
	}

	.then {
		padding: var(--padding-2x) 0 0;
	}

	button {
		margin: var(--padding-2x) 0 0;
	}
</style>
