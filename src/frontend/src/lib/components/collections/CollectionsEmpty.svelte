<script lang="ts">
	import { getContext } from 'svelte';
	import { createBubbler } from 'svelte/legacy';
	import { i18n } from '$lib/stores/i18n.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const bubble = createBubbler();
</script>

{#if $store.rules?.length === 0}
	<p>
		{$i18n.collections.none}
		<button class="text" onclick={bubble('click')}>{$i18n.collections.title}</button>.
	</p>
{/if}

<style lang="scss">
	p {
		grid-column-start: 1;
		grid-column-end: 5;

		margin: var(--padding) var(--padding-2x);
		padding: calc(var(--padding) / 3) var(--padding);
	}

	button {
		display: inline-block;
		margin: 0;
	}
</style>
