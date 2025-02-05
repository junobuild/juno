<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import Collections from '$lib/components/collections/Collections.svelte';
	import { DbCollectionType } from '$lib/constants/rules.constants';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	onMount(() => store.update((data) => ({ ...data, rule: undefined })));
</script>

<Collections type={DbCollectionType} />
