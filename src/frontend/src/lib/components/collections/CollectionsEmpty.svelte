<script lang="ts">
	import { getContext } from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	interface Props {
		onclick: () => void;
	}

	let { onclick }: Props = $props();

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);
</script>

{#if $store.rules?.length === 0}
	<p>
		{$i18n.collections.none} <button class="text" {onclick}>{$i18n.collections.title}</button>.
	</p>
{/if}

<style lang="scss">
	p {
		grid-column-start: 1;
		grid-column-end: 5;

		margin: var(--padding) var(--padding-2x);
		padding: calc(var(--padding) / 3) var(--padding);
	}

	button.text {
		display: inline-block;
		margin: var(--padding) 0;
	}
</style>
