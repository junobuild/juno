<script lang="ts">
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsStore
	} from '$lib/types/tabs.context';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import { nonNullish } from '$lib/utils/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import MissionControlObservatory from '$lib/components/mission-control/MissionControlObservatory.svelte';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'observatory.overview'
		}
	];

	const store = writable<TabsStore>({
		tabId: tabs[0].id,
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});
</script>

<IdentityGuard>
	<Tabs help="https://juno.build/docs/miscellaneous/monitoring">
		{#if nonNullish($missionControlStore)}
			<MissionControlObservatory missionControlId={$missionControlStore} />
		{/if}
	</Tabs>
</IdentityGuard>
