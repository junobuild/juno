import { type ConsoleActor, type SatelliteActor } from '$lib/api/actors/actor.factory';
import type { Actor } from '@dfinity/pic';
import { arrayBufferToUint8Array, toNullable } from '@dfinity/utils';
import { mockBlob } from '../mocks/storage.mocks';

export const uploadFile = async ({
	actor,
	proposalId,
	collection = '#dapp',
	full_path = '/hello3.html',
	name = 'hello3.html',
	description
}: {
	actor: Actor<SatelliteActor | ConsoleActor>;
	proposalId: bigint;
	name?: string;
	full_path?: string;
	collection?: string;
	description?: string;
}) => {
	const { init_proposal_asset_upload, commit_proposal_asset_upload, upload_proposal_asset_chunk } =
		actor;

	const file = await init_proposal_asset_upload(
		{
			collection,
			description: toNullable(description),
			encoding_type: [],
			full_path,
			name,
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
