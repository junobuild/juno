import type { ProposalRecord } from '$lib/types/proposals';
import type { SatelliteIdText } from '$lib/types/satellite';
import { type Readable, writable } from 'svelte/store';

export interface ProposalsStoreData {
	satellites: Record<SatelliteIdText, ProposalRecord[]>;
}

export interface ProposalsStore extends Readable<ProposalsStoreData> {
	setSatellite: (params: { satelliteId: SatelliteIdText; proposals: ProposalRecord[] }) => void;
	reset: () => void;
}

const initProposalsStore = (): ProposalsStore => {
	const INITIAL: ProposalsStoreData = {
		satellites: {}
	};

	const { subscribe, update, set } = writable<ProposalsStoreData>(INITIAL);

	return {
		subscribe,

		setSatellite({ satelliteId, proposals }) {
			update((state) => ({
				...state,
				satellites: {
					...state.satellites,
					[satelliteId]: proposals
				}
			}));
		},

		reset: () => set(INITIAL)
	};
};

export const proposalsStore = initProposalsStore();
