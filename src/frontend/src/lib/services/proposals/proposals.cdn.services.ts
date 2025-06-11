import type { AssetNoContent } from '$declarations/satellite/satellite.did';
import { listAssets } from '$lib/api/satellites.api';
import { COLLECTION_CDN_RELEASES } from '$lib/constants/storage.constants';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ListParams } from '$lib/types/list';
import type { ProposalRecord } from '$lib/types/proposals';
import type { SatelliteIdText } from '$lib/types/satellite';
import { container } from '$lib/utils/juno.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, isEmptyString, isNullish } from '@dfinity/utils';
import { getProposal } from '@junobuild/cdn';
import { listAssets as listAssetsLib } from '@junobuild/core';
import type { Asset } from '@junobuild/storage';
import { get } from 'svelte/store';

export const findWasmAssetForProposal = async ({
	proposal: proposalRecord,
	satelliteId,
	identity
}: {
	proposal: ProposalRecord;
	satelliteId: SatelliteIdText;
	identity: OptionIdentity;
}): Promise<Asset | undefined> => {
	try {
		assertNonNullish(identity);

		const [{ proposal_id }, { sha256, proposal_type }] = proposalRecord;

		if (!('SegmentsDeployment' in proposal_type)) {
			toasts.error({
				text: get(i18n).errors.find_wasm_asset_for_proposal_invalid_type_error
			});

			return undefined;
		}

		const {
			SegmentsDeployment: { satellite_version }
		} = proposal_type;

		const version = fromNullable(satellite_version);

		if (isEmptyString(version)) {
			toasts.error({
				text: get(i18n).errors.find_wasm_asset_for_proposal_incomplete_version_error
			});

			return undefined;
		}

		const nullishSha256 = fromNullable(sha256);

		if (isNullish(nullishSha256)) {
			toasts.error({
				text: get(i18n).errors.find_wasm_asset_for_proposal_missing_change_hash
			});

			return undefined;
		}

		const satellite = {
			satelliteId,
			identity,
			...container()
		};

		const cdn = { satellite };

		const proposalResult = await getProposal({
			cdn,
			proposal_id
		});

		const proposal = fromNullable(proposalResult);

		if (isNullish(proposal)) {
			toasts.error({
				text: get(i18n).errors.find_wasm_asset_for_proposal_proposal_not_found
			});

			return undefined;
		}

		if (!('Executed' in proposal.status)) {
			toasts.error({
				text: get(i18n).errors.find_wasm_asset_for_proposal_not_executed
			});

			return undefined;
		}

		const { items } = await listAssetsLib({
			collection: COLLECTION_CDN_RELEASES,
			satellite,
			filter: {
				matcher: {
					description: `change=${proposal_id};version=${version}`
				}
			}
		});

		const asset = items?.[0];

		if (isNullish(asset)) {
			toasts.error({
				text: get(i18n).errors.find_wasm_asset_for_proposal_asset_not_found
			});

			return undefined;
		}

		return asset;
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.find_wasm_asset_for_proposal_error,
			detail: err
		});

		return undefined;
	}
};

export const listWasmAssets = async ({
	startAfter,
	satelliteId,
	identity
}: Pick<ListParams, 'startAfter'> & {
	satelliteId: Principal;
	identity: Identity;
}): Promise<{
	items: [string, AssetNoContent][];
	matches_length: bigint;
	items_length: bigint;
}> => {
	const { items, matches_length, items_length } = await listAssets({
		collection: COLLECTION_CDN_RELEASES,
		satelliteId,
		params: {
			startAfter,
			order: {
				desc: true,
				field: 'created_at'
			},
			filter: {}
		},
		identity
	});

	return { items, matches_length, items_length };
};
