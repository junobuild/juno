import { i18n } from '$lib/stores/i18n.store';
import { proposalsStore } from '$lib/stores/proposals.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { LoadProposalsBaseParams, LoadProposalsResult } from '$lib/types/proposals';
import { container } from '$lib/utils/juno.utils';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, nonNullish } from '@dfinity/utils';
import { listProposals } from '@junobuild/cdn';
import { get } from 'svelte/store';

export const reloadSatelliteProposals = async ({
	satelliteId,
	toastError = true,
	...rest
}: {
	satelliteId: Principal;
} & LoadProposalsBaseParams): Promise<LoadProposalsResult> => {
	const result = await loadSatelliteProposals({
		satelliteId,
		...rest
	});

	if (result.result === 'error' && toastError) {
		toasts.error({
			text: get(i18n).errors.load_proposals,
			detail: result.err
		});
	}

	return result;
};

const loadSatelliteProposals = async ({
	satelliteId,
	identity,
	skipReload
}: {
	satelliteId: Principal;
	skipReload: boolean;
	identity: OptionIdentity;
}): Promise<{ result: 'loaded' } | { result: 'skipped' } | { result: 'error'; err: unknown }> => {
	// We load the satellite proposals when needed
	const store = get(proposalsStore);
	if (nonNullish(store.satellites[satelliteId.toText()]) && skipReload) {
		return { result: 'skipped' };
	}

	try {
		// Optional for convenience reasons. A guard prevent the usage of the service while not being sign-in.
		assertNonNullish(identity);

		const { items: proposals } = await listProposals({
			cdn: {
				satellite: {
					satelliteId: satelliteId.toText(),
					identity,
					...container()
				}
			},
			filter: {
				order: [
					{
						desc: true
					}
				],
				// TODO: For now, we list all proposals but, in the future it would be nice to paginate.
				paginate: []
			}
		});

		proposalsStore.setSatellite({
			satelliteId: satelliteId.toText(),
			proposals
		});

		return { result: 'loaded' };
	} catch (err: unknown) {
		return { result: 'error', err };
	}
};
