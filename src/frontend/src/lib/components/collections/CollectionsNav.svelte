<script lang="ts">
	import IconHome from '$lib/components/icons/IconHome.svelte';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import NavSeparator from '$lib/components/ui/NavSeparator.svelte';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collectionSelected = false;
	$: collectionSelected = nonNullish($store.rule);

	let selected: [string, Rule] | undefined = undefined;
	const initSelected = (rule: [string, Rule] | undefined) => (selected = rule);
	$: initSelected($store.rule);

	const dispatch = createEventDispatcher();

	const close = () => dispatch('junoCollectionClose');
	const edit = (rule: [string, Rule] | undefined) => dispatch('junoCollectionEdit', rule);
</script>

<nav class="th">
	<button class="text home" aria-label="List all collections" on:click={close}
		><IconHome size="20px" /></button
	>

	<NavSeparator visible={collectionSelected} />

	{#if collectionSelected}
		<button class="text collection" on:click={() => edit($store.rule)}
			>{$store.rule?.[0] ?? ''}</button
		>
	{/if}

	{#if collectionSelected}
		<slot />
	{/if}
</nav>

<div class="picker">
	<select bind:value={selected} on:change={() => (isNullish(selected) ? close() : edit(selected))}>
		<option value={undefined}>Select a collection</option>
		{#if nonNullish($store.rules)}
			{#each $store.rules as rule}
				<option value={rule}>{rule[0]}</option>
			{/each}
		{/if}
	</select>
</div>

<style lang="scss">
	@use '../../styles/mixins/grid';
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/fonts';

	nav,
	select {
		@include fonts.small;
	}

	nav {
		grid-column: span 4;

		background: var(--color-card-contrast);
		color: var(--color-card);

		display: flex;
		align-items: center;
	}

	.collection {
		text-decoration: none;
		margin: 0 var(--padding) 0 0;

		display: inline-block;
		max-width: 250px;

		@include text.truncate;
	}

	.picker {
		grid-column: span 4;
		padding: 0 var(--padding-2x) var(--padding-2x);
		background: var(--color-card-contrast);

		@include media.min-width(large) {
			display: none;
		}
	}

	select {
		color: var(--color-card-contrast);
		margin: 0;

		width: 100%;
		@include text.truncate;

		&:focus {
			box-shadow: none;
			outline: 2px solid var(--color-secondary);
		}

		&::before {
			content: '\003E';
			padding: 0 var(--padding) 0 0;
		}

		display: block;

		@include media.min-width(large) {
			display: none;
		}
	}

	.home {
		margin: var(--padding-0_25x) var(--padding);
	}
</style>
