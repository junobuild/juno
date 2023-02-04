import { writable } from 'svelte/store';

export interface Busy {
	spinner: boolean;
	close: boolean;
}

const initBusyStore = () => {
	const { subscribe, set } = writable<Busy | undefined>(undefined);

	return {
		subscribe,

		start() {
			set({ spinner: true, close: false });
		},

		show() {
			set({ spinner: false, close: true });
		},

		stop() {
			set(undefined);
		}
	};
};

export const busy = initBusyStore();
