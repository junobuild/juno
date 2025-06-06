<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsData
	} from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';
    import IdentityGuard from "$lib/components/guards/IdentityGuard.svelte";
    import Tabs from "$lib/components/ui/Tabs.svelte";
    import WalletLoader from "$lib/components/wallet/WalletLoader.svelte";
    import SatellitesLoader from "$lib/components/loaders/SatellitesLoader.svelte";
    import OrbitersLoader from "$lib/components/loaders/OrbitersLoader.svelte";
    import MissionControlGuard from "$lib/components/guards/MissionControlGuard.svelte";

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'upgrade_dock.title'
		}
	];

	const store = writable<TabsData>({
		tabId: initTabId(tabs),
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});
</script>

<IdentityGuard>
    <Tabs help="https://juno.build/docs/build/authentication">
        <WalletLoader>
            <SatellitesLoader>
                <OrbitersLoader>
                    <MissionControlGuard>
                        Hello
                    </MissionControlGuard>
                </OrbitersLoader>
            </SatellitesLoader>
        </WalletLoader>
    </Tabs>
</IdentityGuard>
