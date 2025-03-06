<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getContext, type Snippet } from 'svelte';
	import IconHome from '$lib/components/icons/IconHome.svelte';
	import NavSeparator from '$lib/components/ui/NavSeparator.svelte';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import type { CollectionRule } from '$lib/types/collection';

	interface Props {
		children?: Snippet;
		onclose: () => void;
		onedit: (rule: CollectionRule | undefined) => void;
	}

	let { children, onclose, onedit }: Props = $props();

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collectionSelected = $derived(nonNullish($store.rule));

	let selected: CollectionRule | undefined = $state(undefined);
	const initSelected = (rule: CollectionRule | undefined) => (selected = rule);
	$effect(() => {
		initSelected($store.rule);
	});

	const close = () => onclose();
	const edit = (rule: CollectionRule | undefined) => onedit(rule);
</script>

<nav class="th">
	<button class="text home" aria-label="List all collections" onclick={close}
		><IconHome size="20px" /></button
	>

	<NavSeparator visible={collectionSelected} />

	{#if collectionSelected}
		<button class="text collection" onclick={() => edit($store.rule)}
			>{$store.rule?.[0] ?? ''}</button
		>
	{/if}

	{#if collectionSelected}
		{@render children?.()}
	{/if}
</nav>

<div class="picker">
	<select bind:value={selected} onchange={() => (isNullish(selected) ? close() : edit(selected))}>
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

		display: block;

		@include text.truncate;

		&:focus {
			outline: 2px solid var(--color-secondary);
		}

		&::before {
			content: '\003E';
			padding: 0 var(--padding) 0 0;
		}

		@include media.min-width(large) {
			display: none;
		}
	}

	.home {
		margin: var(--padding-0_25x) var(--padding);
	}
</style>
