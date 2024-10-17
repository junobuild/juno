import type { PrincipalText } from '$lib/types/itentity';
import type { Subnet } from '$lib/types/subnet';
import { writable, type Readable } from 'svelte/store';

export type SubnetsData = Record<PrincipalText, Subnet | undefined | null>;

export interface SubnetsStore extends Readable<SubnetsData> {
	setSubnets: (params: { canisterId: PrincipalText; subnet: Subnet | undefined | null }) => void;
	reset: () => void;
}

const initSubnetsStore = (): SubnetsStore => {
	const INITIAL: SubnetsData = {};

	const { subscribe, update, set } = writable<SubnetsData>(INITIAL);

	return {
		subscribe,

		setSubnets({ canisterId, subnet }) {
			update((state) => ({
				...state,
				[canisterId]: subnet
			}));
		},

		reset: () => set(INITIAL)
	};
};

export const subnetsStore = initSubnetsStore();
