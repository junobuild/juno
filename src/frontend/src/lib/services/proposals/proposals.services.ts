import { reloadSatelliteProposals } from '$lib/services/proposals/proposals.list.satellite.services';
import { loadSnapshots } from '$lib/services/snapshots.services';
import { wizardBusy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ProposalRecord } from '$lib/types/proposals';
import type { SatelliteIdText } from '$lib/types/satellite';
import { container } from '$lib/utils/juno.utils';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import { executeApplyProposal, type ApplyProposalProgress } from '@junobuild/cdn';
import { get } from 'svelte/store';

export interface ApplyProposalParams {
	onProgress: (progress: ApplyProposalProgress | undefined) => void;
	nextSteps: (steps: 'init' | 'in_progress' | 'ready' | 'error') => void;
	clearProposalAssets: boolean;
	takeSnapshot: boolean;
	identity: OptionIdentity;
	proposal: ProposalRecord;
	satelliteId: SatelliteIdText;
}

export const applyProposal = async ({
	onProgress,
	nextSteps,
	identity,
	satelliteId,
	proposal: proposalRecord,
	takeSnapshot,
	clearProposalAssets
}: ApplyProposalParams) => {
	onProgress(undefined);

	wizardBusy.start();

	nextSteps('in_progress');

	try {
		assertNonNullish(identity);

		const [{ proposal_id }, { sha256 }] = proposalRecord;

		const nullishSha256 = fromNullable(sha256);
		assertNonNullish(nullishSha256);

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
			takeSnapshot,
			clearProposalAssets,
			onProgress,
			postApply
		});

		// Small delay to make "ready" more visual
		setTimeout(() => {
			nextSteps('ready');

			wizardBusy.stop();
		}, 500);
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.apply_proposal_error,
			detail: err
		});

		nextSteps('error');

		wizardBusy.stop();
	}
};
