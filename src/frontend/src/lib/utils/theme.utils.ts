import { browser } from '$app/environment';
import type { Color, Theme } from '$lib/types/theme';
import { setLocalStorageItem } from '$lib/utils/local-storage.utils';

export const applyColor = (theme: Color) => {
	const { documentElement, head } = document;

	documentElement.setAttribute('color', theme);

	const color: string = getComputedStyle(documentElement).getPropertyValue('--color-theme');
	head.children.namedItem('theme-color')?.setAttribute('content', color.trim());
};

export const applyTheme = (theme: Theme) => {
	if (!browser) {
		return;
	}

	const { documentElement } = document;

	documentElement.setAttribute('theme', theme);

	setLocalStorageItem({ key: 'theme', value: theme });
};
