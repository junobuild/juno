<script lang="ts">
	import { satelliteStore } from '$lib/stores/satellite.store';
	import Users from '$lib/components/auth/Users.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import SignInMethod from '$lib/components/auth/SignInMethod.svelte';
	import SatelliteGuard from '$lib/components/guards/SatelliteGuard.svelte';
	import { writable } from 'svelte/store';
	import type { Tab, TabsContext, TabsStore } from '$lib/types/tabs.context';
	import { setContext } from 'svelte';
	import { TABS_CONTEXT_KEY } from '$lib/types/tabs.context';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import { nonNullish } from '$lib/utils/utils';

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'authentication.users'
		},
		{
			id: Symbol('2'),
			labelKey: 'authentication.methods'
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
	<Tabs help="https://juno.build/docs/build/authentication">
		<SatelliteGuard>
			{#if nonNullish($satelliteStore)}
				{#if $store.tabId === $store.tabs[0].id}
					<Users satelliteId={$satelliteStore.satellite_id} />
				{:else if $store.tabId === $store.tabs[1].id}
					<SignInMethod />
				{/if}
			{/if}
		</SatelliteGuard>
	</Tabs>
</IdentityGuard>
