import { layoutNavigation } from '$lib/stores/layout-navigation.store';
import { satelliteName } from '$lib/utils/satellite.utils';
import { derived, type Readable } from 'svelte/store';

export const layoutTitle: Readable<string | undefined> = derived(
	[layoutNavigation],
	([$layoutNavigation]) => {
		if ($layoutNavigation?.data.satellite?.useInPageTitle === true) {
			return satelliteName($layoutNavigation.data.satellite.satellite);
		}

		return $layoutNavigation?.data.title;
	}
);
