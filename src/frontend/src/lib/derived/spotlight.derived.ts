import IconBook from '$lib/components/icons/IconBook.svelte';
import IconCodeBranch from '$lib/components/icons/IconCodeBranch.svelte';
import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
import IconRocket from '$lib/components/icons/IconRocket.svelte';
import IconWallet from '$lib/components/icons/IconWallet.svelte';
import { authNotSignedIn } from '$lib/derived/auth.derived';
import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
import { i18n } from '$lib/stores/i18n.store';
import type {
	SpotlightItemFilterParams,
	SpotlightItems,
	SpotlightNavItem
} from '$lib/types/spotlight';
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
						href: '/mission-control',
						filter: ({ signedIn, query }: SpotlightItemFilterParams) =>
							signedIn && $i18n.mission_control.title.toLowerCase().includes(query)
					},
					{
						type: 'nav' as const,
						icon: IconWallet,
						text: $i18n.wallet.title,
						href: '/wallet',
						filter: ({ signedIn, query }: SpotlightItemFilterParams) =>
							signedIn && $i18n.wallet.title.toLowerCase().includes(query)
					}
				]
);

const homeItem: Readable<SpotlightNavItem> = derived(
	[i18n, authNotSignedIn],
	([$i18n, $authNotSignedIn]) => ({
		type: 'nav' as const,
		icon: IconRocket,
		text: $authNotSignedIn ? $i18n.core.home : $i18n.satellites.launchpad,
		href: '/',
		filter: ({ query }: SpotlightItemFilterParams) =>
			[$i18n.core.home, $i18n.satellites.launchpad].find((text) =>
				text.toLowerCase().includes(query)
			) !== undefined
	})
);

const externalItems: Readable<SpotlightItems> = derived([i18n], ([$i18n]) => [
	{
		type: 'nav' as const,
		icon: IconBook,
		text: $i18n.core.docs,
		href: 'https://juno.build/docs/intro',
		external: true,
		filter: ({ query }: SpotlightItemFilterParams) => $i18n.core.docs.toLowerCase().includes(query)
	},
	{
		type: 'nav' as const,
		icon: IconCodeBranch,
		text: $i18n.core.changelog,
		href: 'https://juno.build/changelog',
		external: true,
		filter: ({ query }: SpotlightItemFilterParams) =>
			$i18n.core.changelog.toLowerCase().includes(query)
	}
]);

export const spotlightItems: Readable<SpotlightItems> = derived(
	[homeItem, externalItems, missionControlSpotlightItems],
	([$homeItem, $externalItems, $missionControlSpotlightItems]) => [
		$homeItem,
		...$externalItems,
		...$missionControlSpotlightItems
	]
);
