<script lang="ts">
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { getContext } from 'svelte';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);
</script>

{#if $store.rules?.length === 0}
	<p>No collection defined. Start one in <button class="text" on:click>Rules</button> tab.</p>
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
