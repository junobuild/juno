import { authSignedInStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { layoutNavigation } from '$lib/stores/layout.navigation.store';
import { satelliteName } from '$lib/utils/satellite.utils';
import { nonNullish, notEmptyString } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

const JUNO_CONSOLE = 'Juno Console';

export const layoutNavigationTitle: Readable<string> = derived(
	[layoutNavigation, i18n, authSignedInStore],
	([$layoutNavigation, $i18n, $authSignedInStore]) => {
		if (!$authSignedInStore) {
			return JUNO_CONSOLE;
		}

		if (
			nonNullish($layoutNavigation?.data.satellite) &&
			notEmptyString($layoutNavigation?.data.title)
		) {
			const satName = satelliteName($layoutNavigation.data.satellite.satellite);

			return `${$layoutNavigation?.data.title ?? ''} / ${satName} / ${JUNO_CONSOLE}`;
		}

		return `${$layoutNavigation?.data.title ?? $i18n.satellites.launchpad} / ${JUNO_CONSOLE}`;
	}
);
