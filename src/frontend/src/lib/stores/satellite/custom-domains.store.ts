import type { CustomDomains } from '$lib/types/custom-domain';
import type { SatelliteIdText } from '$lib/types/satellite';
import { writable, type Readable } from 'svelte/store';

export type CustomDomainsData = Record<SatelliteIdText, CustomDomains>;

export interface CustomDomainsStore extends Readable<CustomDomainsData> {
	setCustomDomains: (params: {
		satelliteId: SatelliteIdText;
		customDomains: CustomDomains;
	}) => void;
	reset: () => void;
}

const initCustomDomainsStore = (): CustomDomainsStore => {
	const INITIAL: CustomDomainsData = {};

	const { subscribe, update, set } = writable<CustomDomainsData>(INITIAL);

	return {
		subscribe,

		setCustomDomains({ satelliteId, customDomains }) {
			update((state) => ({
				...state,
				[satelliteId]: customDomains
			}));
		},

		reset: () => set(INITIAL)
	};
};

export const customDomainsStore = initCustomDomainsStore();
