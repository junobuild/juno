import type { LayoutMenuState } from '$lib/types/layout-menu';
import { applyMenuState } from '$lib/utils/layout-menu.utils';
import { getLocalStorageMenuState } from '$lib/utils/local-storage.utils';
import { type Readable, writable } from 'svelte/store';

// Menu open or closed. Useful for mobile.

export const layoutMenuOpen = writable<boolean>(false);

// State of the menu

export interface LayoutMenuStateStore extends Readable<LayoutMenuState> {
	toggle: () => void;
}

const initLayoutMenuStateStore = (): LayoutMenuStateStore => {
	const { subscribe, update } = writable<LayoutMenuState>(getLocalStorageMenuState());

	return {
		subscribe,

		toggle: () => {
			update((state) => {
				const menuState = state === 'expanded' ? 'collapsed' : 'expanded';

				applyMenuState(menuState);

				return menuState;
			});
		}
	};
};

export const layoutMenuState = initLayoutMenuStateStore();
