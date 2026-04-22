<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import { getContext, setContext } from 'svelte';
	import DbCollections from '$lib/components/satellites/db/DbCollections.svelte';
	import DbData from '$lib/components/satellites/db/DbData.svelte';
	import { DbCollectionType } from '$lib/constants/rules.constants';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { initListParamsContext } from '$lib/stores/app/list-params.context.store';
	import { initRulesContext } from '$lib/stores/satellite/rules.context.store';
	import {
		type ListParamsContext,
		LIST_PARAMS_CONTEXT_KEY,
		ListParamsKey
	} from '$lib/types/list-params.context';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { TABS_CONTEXT_KEY, type TabsContext } from '$lib/types/tabs.context';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	// svelte-ignore state_referenced_locally
	const context = initRulesContext({
		satelliteId,
		type: DbCollectionType
	});

	$effect(() => {
		context.init({ satelliteId, identity: $authIdentity });
	});

	setContext<RulesContext>(RULES_CONTEXT_KEY, context);

	setContext<ListParamsContext>(
		LIST_PARAMS_CONTEXT_KEY,
		initListParamsContext({ key: ListParamsKey.DOCS })
	);

	const { store: tabsStore }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);
</script>

{#if $tabsStore.tabId === $tabsStore.tabs[0].id}
	<DbData />
{:else if $tabsStore.tabId === $tabsStore.tabs[1].id}
	<DbCollections />
{/if}
