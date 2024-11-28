import type { PrincipalText } from '$lib/types/itentity';
import type { Subnet } from '$lib/types/subnet';
import type { Option } from '$lib/types/utils';
import { writable, type Readable } from 'svelte/store';

export type SubnetData = Record<PrincipalText, Subnet | undefined | null>;

export interface SubnetStore extends Readable<SubnetData> {
	set: (params: { canisterId: PrincipalText; subnet: Option<Subnet> }) => void;
	reset: () => void;
}

const initSubnetStore = (): SubnetStore => {
	const INITIAL: SubnetData = {};

	const { subscribe, update, set } = writable<SubnetData>(INITIAL);

	return {
		subscribe,

		set({ canisterId, subnet }) {
			update((state) => ({
				...state,
				[canisterId]: subnet
			}));
		},

		reset: () => set(INITIAL)
	};
};

export const subnetStore = initSubnetStore();
