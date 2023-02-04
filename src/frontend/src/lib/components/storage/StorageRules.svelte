<script lang="ts">
	import Rules from '$lib/components/rules/Rules.svelte';
	import { StorageRulesType } from '$lib/constants/rules.constants';
	import { getContext, onMount } from 'svelte';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	onMount(() => store.update((data) => ({ ...data, rule: undefined })));
</script>

<Rules type={StorageRulesType} />
