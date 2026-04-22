import type { SatelliteDid } from '$declarations';
import { listAssets } from '$lib/api/satellites.api';
import { COLLECTION_CDN_RELEASES } from '$lib/constants/storage.constants';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { NullishIdentity } from '$lib/types/itentity';
import type { ListOrder } from '$lib/types/list';
import type { ProposalRecord } from '$lib/types/proposals';
import type { SatelliteIdText } from '$lib/types/satellite';
import { container } from '$lib/utils/juno.utils';
import { assertNonNullish, fromNullable, isEmptyString, isNullish } from '@dfinity/utils';
import { Principal } from '@icp-sdk/core/principal';
import { getProposal } from '@junobuild/cdn';
import { get } from 'svelte/store';

const LIST_PROPOSALS_ORDER: ListOrder = {
	desc: true,
	field: 'created_at'
};

export const findWasmAssetForProposal = async ({
	proposal: proposalRecord,
	satelliteId,
	identity
}: {
	proposal: ProposalRecord;
	satelliteId: SatelliteIdText;
	identity: NullishIdentity;
}): Promise<SatelliteDid.AssetNoContent | undefined> => {
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
			proposalId: proposal_id
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

		const { items } = await listAssets({
			collection: COLLECTION_CDN_RELEASES,
			satelliteId: Principal.fromText(satelliteId),
			params: {
				filter: {
					description: `change=${proposal_id};version=${version}`
				},
				order: LIST_PROPOSALS_ORDER
			},
			identity
		});

		const asset = items?.[0];

		if (isNullish(asset)) {
			toasts.error({
				text: get(i18n).errors.find_wasm_asset_for_proposal_asset_not_found
			});

			return undefined;
		}

		const [_, assetNoContent] = asset;
		return assetNoContent;
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.find_wasm_asset_for_proposal_error,
			detail: err
		});

		return undefined;
	}
};
