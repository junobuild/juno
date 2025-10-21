<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { getContext, setContext } from 'svelte';
	import StorageCollections from '$lib/components/storage/StorageCollections.svelte';
	import StorageData from '$lib/components/storage/StorageData.svelte';
	import { StorageCollectionType } from '$lib/constants/rules.constants';
	import { authStore } from '$lib/stores/auth.store';
	import { initRulesContext } from '$lib/stores/rules.context.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { TABS_CONTEXT_KEY, type TabsContext } from '$lib/types/tabs.context';
	import { initListParamsContext } from '$lib/stores/list-params.context.store';
	import {
		type ListParamsContext,
		LIST_PARAMS_CONTEXT_KEY,
		LIST_PARAMS_KEY
	} from '$lib/types/list-params.context';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	const context = initRulesContext({
		satelliteId,
		type: StorageCollectionType
	});

	$effect(() => {
		context.init({ satelliteId, identity: $authStore.identity });
	});

	setContext<RulesContext>(RULES_CONTEXT_KEY, context);
	setContext<ListParamsContext>(
		LIST_PARAMS_CONTEXT_KEY,
		initListParamsContext(LIST_PARAMS_KEY.STORAGE)
	);

	const { store: tabsStore }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);
</script>

{#if $tabsStore.tabId === $tabsStore.tabs[0].id}
	<StorageData />
{:else if $tabsStore.tabId === $tabsStore.tabs[1].id}
	<StorageCollections />
{/if}
