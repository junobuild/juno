<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { createEventDispatcher } from 'svelte';

	let choice: 'sdk' | 'deploy' = 'sdk';

	const dispatch = createEventDispatcher();
</script>

<h2><IconSatellite size="24px" /> {$i18n.satellites.ready}</h2>

<p>{$i18n.on_boarding.what}</p>

<div class="radio">
	<label>
		<input type="radio" bind:group={choice} name="choice" value="sdk" />
		<span>{$i18n.on_boarding.dapp}</span>
	</label>
	<label>
		<input type="radio" bind:group={choice} name="choice" value="deploy" />
		<span>{$i18n.on_boarding.website}</span>
	</label>
</div>

<button on:click={() => dispatch('junoNext', choice)}>{$i18n.core.continue}</button>

<button class="text" on:click={() => dispatch('junoSkip')}>{$i18n.core.skip}</button>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	h2 {
		@include overlay.title;
	}

	p {
		margin: 0 0 var(--padding);
	}

	.radio {
		display: flex;
		flex-direction: column;

		margin: 0 0 var(--padding-2x);
	}
</style>
