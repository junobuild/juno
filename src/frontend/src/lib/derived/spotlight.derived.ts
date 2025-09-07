import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
import IconRocket from '$lib/components/icons/IconRocket.svelte';
import IconWallet from '$lib/components/icons/IconWallet.svelte';
import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
import { i18n } from '$lib/stores/i18n.store';
import type { SpotlightItems, SpotlightNavItem } from '$lib/types/spotlight';
import { isNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

const missionControlSpotlightItems: Readable<SpotlightItems> = derived(
	[i18n, missionControlIdDerived],
	([$i18n, $missionControlIdDerived]) =>
		isNullish($missionControlIdDerived)
			? []
			: [
					{
						type: 'nav' as const,
						icon: IconMissionControl,
						text: $i18n.mission_control.title,
						href: '/mission-control'
					},
					{
						type: 'nav' as const,
						icon: IconWallet,
						text: $i18n.wallet.title,
						href: '/wallet'
					}
				]
);

export const spotlightItems: Readable<SpotlightItems> = derived(
	[i18n, missionControlSpotlightItems],
	([$i18n, $missionControlSpotlightItems]) => {
		const launchpadItem: SpotlightNavItem = {
			type: 'nav',
			icon: IconRocket,
			text: $i18n.satellites.launchpad,
			href: '/'
		};

		return [launchpadItem, ...$missionControlSpotlightItems];
	}
);
