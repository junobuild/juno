import { layoutNavigation } from '$lib/stores/app/layout-navigation.store';
import { metadataUiName } from '$lib/utils/metadata-ui.utils';
import { derived, type Readable } from 'svelte/store';

export const layoutTitle: Readable<string | undefined> = derived(
	[layoutNavigation],
	([$layoutNavigation]) => {
		if ($layoutNavigation?.data.satellite?.useInPageTitle === true) {
			return metadataUiName($layoutNavigation.data.satellite.satellite);
		}

		if ($layoutNavigation?.data.ufo?.useInPageTitle === true) {
			return metadataUiName($layoutNavigation.data.ufo.ufo);
		}

		return $layoutNavigation?.data.title;
	}
);
