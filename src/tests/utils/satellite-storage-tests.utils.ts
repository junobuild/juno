import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { arrayBufferToUint8Array, toNullable } from '@dfinity/utils';
import type { Actor } from '@hadronous/pic';
import { mockBlob } from '../mocks/storage.mocks';

export const uploadAsset = async ({
	full_path,
									  description,
	name,
	collection,
	actor
}: {
	full_path: string;
	description?: string;
	name: string;
	collection: string;
	actor: Actor<SatelliteActor>;
}) => {
	const { commit_asset_upload, upload_asset_chunk, init_asset_upload } = actor;

	const file = await init_asset_upload({
		collection,
		description: toNullable(description),
		encoding_type: [],
		full_path,
		name,
		token: toNullable()
	});

	const chunk = await upload_asset_chunk({
		batch_id: file.batch_id,
		content: arrayBufferToUint8Array(await mockBlob.arrayBuffer()),
		order_id: [0n]
	});

	await commit_asset_upload({
		batch_id: file.batch_id,
		chunk_ids: [chunk.chunk_id],
		headers: []
	});
};
