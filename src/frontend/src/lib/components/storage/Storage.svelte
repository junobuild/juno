<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { writable } from 'svelte/store';
	import { RULES_CONTEXT_KEY, type RulesContext, type RulesStore } from '$lib/types/rules.context';
	import { StorageRulesType } from '$lib/constants/rules.constants';
	import { getContext, setContext } from 'svelte';
	import { TABS_CONTEXT_KEY, type TabsContext } from '$lib/types/tabs.context';
	import StorageData from '$lib/components/storage/StorageData.svelte';
	import StorageRules from '$lib/components/storage/StorageRules.svelte';
	import { reloadContextRules } from '$lib/utils/rules.utils';
	import { authStore } from '$lib/stores/auth.store';

	export let satelliteId: Principal;

	const store = writable<RulesStore>({
		satelliteId,
		rules: undefined,
		rule: undefined
	});

	const reloadRules = async () =>
		reloadContextRules({
			satelliteId,
			type: StorageRulesType,
			store,
			identity: $authStore.identity
		});

	$: satelliteId, (async () => reloadRules())();

	setContext<RulesContext>(RULES_CONTEXT_KEY, {
		store,
		reload: async () => reloadRules()
	});

	const { store: tabsStore }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);
</script>

{#if $tabsStore.tabId === $tabsStore.tabs[0].id}
	<StorageData />
{:else if $tabsStore.tabId === $tabsStore.tabs[1].id}
	<StorageRules />
{/if}
