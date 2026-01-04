import type { LaunchpadLayout } from '$lib/types/layout';
import {
	getLocalStorageLaunchpadLayout,
	setLocalStorageItem
} from '$lib/utils/local-storage.utils';
import { writable } from 'svelte/store';

const initialLayout = getLocalStorageLaunchpadLayout();

export const initLayout = () => {
	const { subscribe, set } = writable<LaunchpadLayout>(initialLayout);

	return {
		subscribe,

		select: (layout: LaunchpadLayout) => {
			setLocalStorageItem({ key: 'launchpad_layout', value: layout });
			set(layout);
		}
	};
};

export const layoutLaunchpad = initLayout();
