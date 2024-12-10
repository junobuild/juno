import { browser } from '$app/environment';
import { DEFAULT_LIST_PARAMS } from '$lib/constants/data.constants';
import type { ListParamsStoreData } from '$lib/stores/list-params.store';
import type { Languages } from '$lib/types/languages';
import { SatellitesLayout } from '$lib/types/layout';
import { Theme } from '$lib/types/theme';
import { nonNullish } from '@dfinity/utils';

export const setLocalStorageItem = ({ key, value }: { key: string; value: string }) => {
	// Pre-rendering guard
	if (!browser) {
		return;
	}

	try {
		localStorage.setItem(key, value);
	} catch (err: unknown) {
		// We use the local storage for the operational part of the app but, not crucial
		console.error(err);
	}
};

export const getLocalStorageLang = (): Languages => {
	try {
		const { lang }: Storage = browser ? localStorage : ({ lang: 'en' } as unknown as Storage);
		return lang;
	} catch (err: unknown) {
		// We use the local storage for the operational part of the app but, not crucial
		console.error(err);
		return 'en';
	}
};

export const getLocalListParams = (): ListParamsStoreData => {
	try {
		const { list_params }: Storage = browser
			? localStorage
			: ({ list_params: JSON.stringify(DEFAULT_LIST_PARAMS) } as unknown as Storage);

		return nonNullish(list_params) ? JSON.parse(list_params) : DEFAULT_LIST_PARAMS;
	} catch (err: unknown) {
		// We use the local storage for the operational part of the app but, not crucial
		console.error(err);
		return DEFAULT_LIST_PARAMS;
	}
};

export const getLocalStorageTheme = (): Theme => {
	try {
		const { theme: storageTheme }: Storage = browser
			? localStorage
			: ({ theme: undefined } as unknown as Storage);

		const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

		return storageTheme ?? (darkMode ? Theme.DARK : Theme.LIGHT);
	} catch (err: unknown) {
		// We ignore the error until we can extra proxy/signin to auth.papy.rs
		return Theme.LIGHT;
	}
};

export const getLocalStorageObserveLogs = (): boolean => {
	try {
		const { observe_logs }: Storage = browser
			? localStorage
			: ({ observe_logs: 'true' } as unknown as Storage);
		return observe_logs === 'true';
	} catch (err: unknown) {
		// We use the local storage for the operational part of the app but, not crucial
		console.error(err);
		return true;
	}
};

export const getLocalStorageSatellitesLayout = (): SatellitesLayout => {
	try {
		const { satellites_layout }: Storage = browser
			? localStorage
			: ({ satellites_layout: SatellitesLayout.CARDS } as unknown as Storage);
		return satellites_layout ?? SatellitesLayout.CARDS;
	} catch (err: unknown) {
		// We use the local storage for the operational part of the app but, not crucial
		console.error(err);
		return SatellitesLayout.CARDS;
	}
};
