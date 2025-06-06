<script lang="ts">
	import { getContext } from 'svelte';
	import CollectionSelection from '$lib/components/collections/CollectionSelection.svelte';
	import type { CollectionRule } from '$lib/types/collection';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const selectionCollection = (rule: CollectionRule | undefined) => {
		onclose();
		store.update((data) => ({ ...data, rule }));
	};
</script>

<CollectionSelection onedit={selectionCollection} />
