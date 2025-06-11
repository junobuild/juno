import { COLLECTION_CDN_RELEASES } from '$lib/constants/storage.constants';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ProposalRecord } from '$lib/types/proposals';
import type { SatelliteIdText } from '$lib/types/satellite';
import { container } from '$lib/utils/juno.utils';
import { assertNonNullish, fromNullable, isEmptyString, isNullish } from '@dfinity/utils';
import { getProposal } from '@junobuild/cdn';
import { listAssets } from '@junobuild/core';
import type { Asset } from '@junobuild/storage';

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
			// TODO
			return;
		}

		const {
			SegmentsDeployment: { satellite_version }
		} = proposal_type;

		const version = fromNullable(satellite_version);

		if (isEmptyString(version)) {
			// TODO
			return;
		}

		const nullishSha256 = fromNullable(sha256);
		assertNonNullish(nullishSha256);

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
			// TODO
			return;
		}

		if (!('Executed' in proposal.status)) {
			// TODO
			return;
		}

		const { items } = await listAssets({
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
			// TODO
			return;
		}

		return asset;
	} catch (err: unknown) {}

	return undefined;
};
