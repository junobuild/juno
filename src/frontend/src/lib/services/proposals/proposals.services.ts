import { reloadSatelliteProposals } from '$lib/services/proposals/proposals.list.satellite.services';
import { loadSnapshots } from '$lib/services/snapshots.services';
import { wizardBusy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ProposalRecord } from '$lib/types/proposals';
import type { SatelliteIdText } from '$lib/types/satellite';
import { container } from '$lib/utils/juno.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import {
	executeApplyProposal,
	executeRejectProposal,
	type ApplyProposalProgress,
	type CdnParameters,
	type CommitProposal,
	type RejectProposalProgress
} from '@junobuild/cdn';
import { get } from 'svelte/store';

interface ExecuteProposalParams {
	nextSteps: (steps: 'init' | 'in_progress' | 'ready' | 'error') => void;
	clearProposalAssets: boolean;
	identity: OptionIdentity;
	proposal: ProposalRecord;
	satelliteId: SatelliteIdText;
}

export interface ApplyProposalParams extends ExecuteProposalParams {
	onProgress: (progress: ApplyProposalProgress | undefined) => void;
	takeSnapshot: boolean;
}

export interface RejectProposalParams extends ExecuteProposalParams {
	onProgress: (progress: RejectProposalProgress | undefined) => void;
}

export const applyProposal = async ({
	onProgress,
	satelliteId,
	takeSnapshot,
	clearProposalAssets,
	...rest
}: ApplyProposalParams) => {
	onProgress(undefined);

	const fn = async ({ identity, ...params }: ExecuteProposalFnParams) => {
		const postApply = async () => {
			const canisterId = Principal.fromText(satelliteId);

			await Promise.all([
				reloadSatelliteProposals({
					satelliteId: canisterId,
					skipReload: false,
					identity
				}),
				...(takeSnapshot
					? [
							loadSnapshots({
								canisterId,
								identity,
								reload: true
							})
						]
					: [])
			]);
		};

		await executeApplyProposal({
			...params,
			takeSnapshot,
			clearProposalAssets,
			onProgress,
			postApply
		});
	};

	const labels = get(i18n);

	await execute({
		fn,
		satelliteId,
		errorMsg: labels.errors.apply_proposal_error,
		...rest
	});
};

export const rejectProposal = async ({
	onProgress,
	satelliteId,
	clearProposalAssets,
	...rest
}: RejectProposalParams) => {
	onProgress(undefined);

	const fn = async ({ identity, ...params }: ExecuteProposalFnParams) => {
		const postReject = async () => {
			const canisterId = Principal.fromText(satelliteId);

			await reloadSatelliteProposals({
				satelliteId: canisterId,
				skipReload: false,
				identity
			});
		};

		await executeRejectProposal({
			...params,
			clearProposalAssets,
			onProgress,
			postReject
		});
	};

	const labels = get(i18n);

	await execute({
		fn,
		satelliteId,
		errorMsg: labels.errors.reject_proposal_error,
		...rest
	});
};

interface ExecuteProposalFnParams {
	cdn: CdnParameters;
	proposal: CommitProposal;
	identity: Identity;
}

const execute = async ({
	nextSteps,
	identity,
	satelliteId,
	proposal: proposalRecord,
	fn,
	errorMsg
}: Omit<ExecuteProposalParams, 'clearProposalAssets'> & {
	fn: (params: ExecuteProposalFnParams) => Promise<void>;
	errorMsg: string;
}) => {
	wizardBusy.start();

	nextSteps('in_progress');

	try {
		assertNonNullish(identity);

		const [{ proposal_id }, { sha256 }] = proposalRecord;

		const nullishSha256 = fromNullable(sha256);
		assertNonNullish(nullishSha256);

		await fn({
			cdn: {
				satellite: {
					satelliteId,
					identity,
					...container()
				}
			},
			proposal: {
				proposal_id,
				sha256: nullishSha256
			},
			identity
		});

		// Small delay to make "ready" more visual
		setTimeout(() => {
			nextSteps('ready');

			wizardBusy.stop();
		}, 500);
	} catch (err: unknown) {
		toasts.error({
			text: errorMsg,
			detail: err
		});

		nextSteps('error');

		wizardBusy.stop();
	}
};
