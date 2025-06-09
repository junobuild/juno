import { proposalsStore } from '$lib/stores/proposals.store';
import type { ProposalRecord } from '$lib/types/proposals';
import type { SatelliteIdText } from '$lib/types/satellite';
import { derived } from 'svelte/store';

export const satellitesProposals = derived([proposalsStore], ([{ satellites }]) => satellites);

export const openSatellitesProposals = derived([satellitesProposals], ([$satellitesProposals]) =>
	Object.entries($satellitesProposals).reduce<Record<SatelliteIdText, ProposalRecord[]>>(
		(acc, [key, value]) => ({
			...acc,
			[key]: value.filter(([_, { status }]) => 'Open' in status)
		}),
		{}
	)
);
