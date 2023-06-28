<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { createEventDispatcher } from 'svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	export let principal: string;

	let choice: 'new' | 'reuse' = 'new';

	const dispatch = createEventDispatcher();
</script>

<p>{$i18n.cli.introduction}</p>

<div class="radio">
	<label>
		<input type="radio" bind:group={choice} name="choice" value="new" />
		<span
			>{@html i18nFormat($i18n.cli.new, [
				{
					placeholder: '{0}',
					value: principal
				}
			])}</span
		>
	</label>
	<label>
		<input type="radio" bind:group={choice} name="choice" value="reuse" />
		<span>{$i18n.cli.reuse}</span>
	</label>
</div>

<button on:click={() => dispatch('junoNext', choice)}>{$i18n.core.continue}</button>

<style lang="scss">
	p {
		margin: 0 0 var(--padding-2x);
	}

	.radio {
		display: flex;
		flex-direction: column;

		margin: 0 0 var(--padding-2x);
	}
</style>
