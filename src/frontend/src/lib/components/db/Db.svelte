<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { getContext, setContext } from 'svelte';
	import { run } from 'svelte/legacy';
	import { writable } from 'svelte/store';
	import DbData from '$lib/components/db/DbData.svelte';
	import DbRules from '$lib/components/db/DbRules.svelte';
	import { CollectionType } from '$lib/constants/rules.constants';
	import { authStore } from '$lib/stores/auth.store';
	import { RULES_CONTEXT_KEY, type RulesContext, type RulesStore } from '$lib/types/rules.context';
	import { TABS_CONTEXT_KEY, type TabsContext } from '$lib/types/tabs.context';
	import { reloadContextRules } from '$lib/utils/rules.utils';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	const store = writable<RulesStore>({
		satelliteId,
		rules: undefined,
		rule: undefined
	});

	const reloadRules = async () =>
		await reloadContextRules({
			satelliteId,
			type: CollectionType,
			store,
			identity: $authStore.identity
		});

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		satelliteId, (async () => await reloadRules())();
	});

	setContext<RulesContext>(RULES_CONTEXT_KEY, {
		store,
		reload: async () => await reloadRules()
	});

	const { store: tabsStore }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);
</script>

{#if $tabsStore.tabId === $tabsStore.tabs[0].id}
	<DbData />
{:else if $tabsStore.tabId === $tabsStore.tabs[1].id}
	<DbRules />
{/if}
