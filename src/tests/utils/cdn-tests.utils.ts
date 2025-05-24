import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { arrayBufferToUint8Array, toNullable } from '@dfinity/utils';
import type { Actor } from '@hadronous/pic';
import { mockBlob } from '../mocks/storage.mocks';

export const uploadFile = async ({
	actor,
	proposalId
}: {
	actor: Actor<SatelliteActor | ConsoleActor>;
	proposalId: bigint;
}) => {
	const { init_proposal_asset_upload, commit_proposal_asset_upload, upload_proposal_asset_chunk } =
		actor;

	const file = await init_proposal_asset_upload(
		{
			collection: '#dapp',
			description: toNullable(),
			encoding_type: [],
			full_path: '/hello3.html',
			name: 'hello3.html',
			token: toNullable()
		},
		proposalId
	);

	const chunk = await upload_proposal_asset_chunk({
		batch_id: file.batch_id,
		content: arrayBufferToUint8Array(await mockBlob.arrayBuffer()),
		order_id: [0n]
	});

	await commit_proposal_asset_upload({
		batch_id: file.batch_id,
		chunk_ids: [chunk.chunk_id],
		headers: []
	});
};
