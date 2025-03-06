<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { getContext, setContext } from 'svelte';
	import DbCollections from '$lib/components/db/DbCollections.svelte';
	import DbData from '$lib/components/db/DbData.svelte';
	import { DbCollectionType } from '$lib/constants/rules.constants';
	import { initRulesContext } from '$lib/stores/rules.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { TABS_CONTEXT_KEY, type TabsContext } from '$lib/types/tabs.context';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	const context = initRulesContext({
		satelliteId,
		type: DbCollectionType
	});

	$effect(() => {
		satelliteId;

		context.reload();
	});

	setContext<RulesContext>(RULES_CONTEXT_KEY, context);

	const { store: tabsStore }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);
</script>

{#if $tabsStore.tabId === $tabsStore.tabs[0].id}
	<DbData />
{:else if $tabsStore.tabId === $tabsStore.tabs[1].id}
	<DbCollections />
{/if}
