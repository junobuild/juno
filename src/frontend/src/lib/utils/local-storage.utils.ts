import { browser } from '$app/environment';
import { DEFAULT_LIST_ORDER } from '$lib/constants/data.constants';
import type { ListOrder } from '$lib/types/list';
import { Theme } from '$lib/types/theme';
import { nonNullish } from '$lib/utils/utils';

export const setLocalStorageItem = ({ key, value }: { key: string; value: string }) => {
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

export const getLocalListOrder = (): ListOrder => {
	try {
		const { order }: Storage = browser
			? localStorage
			: ({ order: JSON.stringify(DEFAULT_LIST_ORDER) } as unknown as Storage);

		return nonNullish(order) ? JSON.parse(order) : DEFAULT_LIST_ORDER;
	} catch (err: unknown) {
		// We use the local storage for the operational part of the app but, not crucial
		console.error(err);
		return DEFAULT_LIST_ORDER;
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
