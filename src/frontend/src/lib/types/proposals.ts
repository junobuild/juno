import type { NullishIdentity } from '$lib/types/itentity';
import type { Proposal, ProposalKey } from '@junobuild/cdn';

export type ProposalRecord = [ProposalKey, Proposal];

export interface LoadProposalsBaseParams {
	skipReload: boolean;
	identity: NullishIdentity;
	toastError?: boolean;
}

export type LoadProposalsResult =
	| { result: 'loaded' }
	| { result: 'skipped' }
	| { result: 'error'; err: unknown };
