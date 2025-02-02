<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import Rules from '$lib/components/rules/Rules.svelte';
	import { StorageCollectionType } from '$lib/constants/rules.constants';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	onMount(() => store.update((data) => ({ ...data, rule: undefined })));
</script>

<Rules type={StorageCollectionType} />
