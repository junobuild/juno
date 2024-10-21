<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { getContext, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import DbData from '$lib/components/db/DbData.svelte';
	import DbRules from '$lib/components/db/DbRules.svelte';
	import { DbRulesType } from '$lib/constants/rules.constants';
	import { authStore } from '$lib/stores/auth.store';
	import { RULES_CONTEXT_KEY, type RulesContext, type RulesStore } from '$lib/types/rules.context';
	import { TABS_CONTEXT_KEY, type TabsContext } from '$lib/types/tabs.context';
	import { reloadContextRules } from '$lib/utils/rules.utils';

	export let satelliteId: Principal;

	const store = writable<RulesStore>({
		satelliteId,
		rules: undefined,
		rule: undefined
	});

	const reloadRules = async () =>
		reloadContextRules({ satelliteId, type: DbRulesType, store, identity: $authStore.identity });

	$: satelliteId, (async () => reloadRules())();

	setContext<RulesContext>(RULES_CONTEXT_KEY, {
		store,
		reload: async () => reloadRules()
	});

	const { store: tabsStore }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);
</script>

{#if $tabsStore.tabId === $tabsStore.tabs[0].id}
	<DbData />
{:else if $tabsStore.tabId === $tabsStore.tabs[1].id}
	<DbRules />
{/if}
