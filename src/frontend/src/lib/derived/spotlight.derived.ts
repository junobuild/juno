import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
import IconAuthentication from '$lib/components/icons/IconAuthentication.svelte';
import IconBook from '$lib/components/icons/IconBook.svelte';
import IconCodeBranch from '$lib/components/icons/IconCodeBranch.svelte';
import IconDatastore from '$lib/components/icons/IconDatastore.svelte';
import IconFunctions from '$lib/components/icons/IconFunctions.svelte';
import IconHosting from '$lib/components/icons/IconHosting.svelte';
import IconLightOff from '$lib/components/icons/IconLightOff.svelte';
import IconLightOn from '$lib/components/icons/IconLightOn.svelte';
import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
import IconRaygun from '$lib/components/icons/IconRaygun.svelte';
import IconRocket from '$lib/components/icons/IconRocket.svelte';
import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
import IconStorage from '$lib/components/icons/IconStorage.svelte';
import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
import IconUpgradeDock from '$lib/components/icons/IconUpgradeDock.svelte';
import IconWallet from '$lib/components/icons/IconWallet.svelte';
import { authNotSignedIn } from '$lib/derived/auth.derived';
import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
import { satelliteStore } from '$lib/derived/satellite.derived';
import { sortedSatelliteUis } from '$lib/derived/satellites.derived';
import { i18n } from '$lib/stores/i18n.store';
import { theme } from '$lib/stores/theme.store';
import type { SatelliteUi } from '$lib/types/satellite';
import type {
	SpotlightActionItem,
	SpotlightItemFilterFn,
	SpotlightItemFilterParams,
	SpotlightItems,
	SpotlightNavItem
} from '$lib/types/spotlight';
import { Theme } from '$lib/types/theme';
import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';
import { analyticsLink, upgradeDockLink } from '$lib/utils/nav.utils';
import { satelliteMatchesFilter } from '$lib/utils/satellite.utils';
import { isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

const withMissionControlItems: Readable<SpotlightItems> = derived(
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
					},
					{
						type: 'nav' as const,
						icon: IconTelescope,
						text: $i18n.monitoring.title,
						href: '/monitoring',
						filter: ({ signedIn, query }: SpotlightItemFilterParams) =>
							signedIn && $i18n.monitoring.title.toLowerCase().includes(query)
					},
					{
						type: 'nav' as const,
						icon: IconUpgradeDock,
						text: $i18n.upgrade.title,
						href: upgradeDockLink(),
						filter: ({ signedIn, query }: SpotlightItemFilterParams) =>
							signedIn && $i18n.upgrade.title.toLowerCase().includes(query)
					}
				]
);

const preferenceItem: Readable<SpotlightNavItem> = derived([i18n], ([$i18n]) => ({
	type: 'nav' as const,
	icon: IconRaygun,
	text: $i18n.preferences.title,
	href: '/preferences',
	filter: ({ signedIn, query }: SpotlightItemFilterParams) =>
		signedIn && $i18n.preferences.title.toLowerCase().includes(query)
}));

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

const themeItem: Readable<SpotlightActionItem> = derived([i18n, theme], ([$i18n, $theme]) => {
	const dark = $theme === Theme.DARK;

	return {
		type: 'action' as const,
		icon: dark ? IconLightOff : IconLightOn,
		text: dark ? $i18n.core.light_off : $i18n.core.light_on,
		action: () => theme.select(dark ? Theme.LIGHT : Theme.DARK),
		filter: ({ query }: SpotlightItemFilterParams) =>
			[$i18n.core.theme, $i18n.core.light_off, $i18n.core.light_on].find((text) =>
				text.toLowerCase().includes(query)
			) !== undefined
	};
});

const analyticsItem: Readable<SpotlightNavItem | undefined> = derived(
	[i18n, authNotSignedIn],
	([$i18n, $authNotSignedIn]) =>
		$authNotSignedIn
			? undefined
			: {
					type: 'nav' as const,
					icon: IconAnalytics,
					text: $i18n.analytics.title,
					href: analyticsLink(),
					filter: ({ query }: SpotlightItemFilterParams) =>
						$i18n.analytics.title.toLowerCase().includes(query)
				}
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

const satellitesItems: Readable<SpotlightItems> = derived(
	[i18n, sortedSatelliteUis, satelliteStore],
	([$i18n, $sortedSatelliteUis, $satelliteStore]) => {
		const mapSatelliteNav = (satellite: SatelliteUi): SpotlightNavItem[] => {
			const {
				satellite_id,
				metadata: { name }
			} = satellite;
			const satelliteId = satellite_id.toText();

			const nameAndId = `${notEmptyString(name) ? `${name} (` : ''}${shortenWithMiddleEllipsis({
				text: satelliteId,
				length: 4
			})}${notEmptyString(name) ? ')' : ''}`;

			const queryParam = `/?s=${satelliteId}`;

			const isSelected = $satelliteStore?.satellite_id.toText() === satelliteId;

			const filter =
				(section: string): SpotlightItemFilterFn =>
				({ query }: SpotlightItemFilterParams) =>
					(isSelected && section.includes(query.toLowerCase())) ||
					satelliteMatchesFilter({ satellite, filter: query.toLowerCase() });

			return [
				{
					type: 'nav' as const,
					icon: IconSatellite,
					text: `${nameAndId}: ${$i18n.satellites.overview}`,
					href: `/satellite${queryParam}`,
					filter: filter($i18n.satellites.overview)
				},
				{
					type: 'nav' as const,
					icon: IconAuthentication,
					text: `${nameAndId}: ${$i18n.authentication.title}`,
					href: `/authentication${queryParam}`,
					filter: filter($i18n.authentication.title)
				},
				{
					type: 'nav' as const,
					icon: IconDatastore,
					text: `${nameAndId}: ${$i18n.datastore.title}`,
					href: `/datastore${queryParam}`,
					filter: filter($i18n.datastore.title)
				},
				{
					type: 'nav' as const,
					icon: IconStorage,
					text: `${nameAndId}: ${$i18n.storage.title}`,
					href: `/storage${queryParam}`,
					filter: filter($i18n.storage.title)
				},
				{
					type: 'nav' as const,
					icon: IconFunctions,
					text: `${nameAndId}: ${$i18n.functions.title}`,
					href: `/functions${queryParam}`,
					filter: filter($i18n.functions.title)
				},
				{
					type: 'nav' as const,
					icon: IconHosting,
					text: `${nameAndId}: ${$i18n.hosting.title}`,
					href: `/hosting${queryParam}`,
					filter: filter($i18n.hosting.title)
				}
			];
		};

		return ($sortedSatelliteUis ?? []).flatMap(mapSatelliteNav);
	}
);

export const spotlightItems: Readable<SpotlightItems> = derived(
	[
		homeItem,
		themeItem,
		externalItems,
		withMissionControlItems,
		analyticsItem,
		satellitesItems,
		preferenceItem
	],
	([
		$homeItem,
		$themeItem,
		$externalItems,
		$missionControlItems,
		$analyticsItem,
		$satellitesItems,
		$preferenceItem
	]) => [
		$homeItem,
		...$missionControlItems,
		...$satellitesItems,
		...(nonNullish($analyticsItem) ? [$analyticsItem] : []),
		$preferenceItem,
		$themeItem,
		...$externalItems
	]
);
