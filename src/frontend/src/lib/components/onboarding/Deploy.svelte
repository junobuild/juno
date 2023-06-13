<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { createEventDispatcher } from 'svelte';
	import Code from '$lib/components/ui/Code.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { satelliteUrl } from '$lib/utils/satellite.utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';

	export let satellite: Satellite | undefined;

	const dispatch = createEventDispatcher();

	let satUrl: string;
	$: satUrl = satelliteUrl(satellite?.satellite_id.toText() ?? '');
</script>

<h2>{$i18n.on_boarding.deploy}</h2>

<p>{$i18n.on_boarding.local}</p>

<p>{$i18n.on_boarding.cli}</p>

<Code code={`npm i -g @junobuild/cli`} language="bash" />

<p class="then">{$i18n.on_boarding.login}</p>

<Code code={`juno login`} language="bash" />

<p class="then">{$i18n.on_boarding.run}</p>

<Code code={`juno deploy`} language="bash" />

<p class="then">
	{@html i18nFormat($i18n.on_boarding.success, [
		{
			placeholder: '{0}',
			value: satUrl
		},
		{
			placeholder: '{1}',
			value: satUrl
		}
	])}
</p>

<button on:click={() => dispatch('junoDone')}>{$i18n.core.done}</button>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	h2 {
		@include overlay.title;
	}

	.then {
		padding: var(--padding-2x) 0 0;
	}
</style>
