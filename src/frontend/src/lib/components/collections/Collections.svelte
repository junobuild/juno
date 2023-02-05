<script lang="ts">
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import IconNew from '$lib/components/icons/IconNew.svelte';
	import { nonNullish } from '$lib/utils/utils';

	export let start = false;

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	const edit = (rule: [string, Rule]) => dispatch('junoCollectionEdit', rule);

	let empty = false;
	$: empty = $store.rules?.length === 0;
</script>

<p class="title collections">Collections</p>

{#if start || !empty}
	<div class="collections">
		{#if start}
			<button class="text action start" on:click={() => dispatch('junoCollectionStart')}
				><IconNew size="16px" /> <span>Start collection</span></button
			>
		{/if}

		{#if nonNullish($store.rules)}
			{#each $store.rules as col}
				<button class="text action" class:offset={start} on:click={() => edit(col)}
					><span>{col[0]}</span></button
				>
			{/each}
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/collections';

	.collections {
		grid-column-start: 1;
		border-right: 2px solid var(--color-card-contrast);

		display: none;

		@include media.min-width(large) {
			display: block;

			height: 100%;
			max-height: 620px;
			overflow-y: auto;
		}

		.action {
			display: flex;
		}
	}

	.title {
		@include collections.title;
	}

	.action {
		@include collections.action;

		&.offset {
			margin: var(--padding-2x) 0 var(--padding-2x) var(--padding-6x);
			box-sizing: border-box;
		}
	}

	.start {
		@include collections.start;
	}
</style>
