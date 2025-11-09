import type { LayoutMenuState } from '$lib/types/layout-menu';
import { setLocalStorageItem } from '$lib/utils/local-storage.utils';

export const applyMenuState = (menuState: LayoutMenuState) => {
	const { documentElement } = document;

	documentElement.setAttribute('menu', menuState);

	setLocalStorageItem({ key: 'menu_state', value: menuState });
};
