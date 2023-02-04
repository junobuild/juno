import type { Theme } from '$lib/types/theme';
import { getLocalStorageTheme } from '$lib/utils/local-storage.utils';
import { applyTheme } from '$lib/utils/theme.utils';
import { writable } from 'svelte/store';

const initialTheme: Theme = getLocalStorageTheme();
applyTheme(initialTheme);

export const initTheme = () => {
	const { subscribe, set } = writable<Theme>(initialTheme);

	return {
		subscribe,

		select: (theme: Theme) => {
			applyTheme(theme);
			set(theme);
		}
	};
};

export const theme = initTheme();
