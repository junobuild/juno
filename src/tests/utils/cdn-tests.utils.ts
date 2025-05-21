import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { arrayBufferToUint8Array, toNullable } from '@dfinity/utils';
import type { Actor } from '@hadronous/pic';
import { mockBlob } from '../mocks/storage.mocks';

export const uploadFile = async ({
	actor,
	proposalId
}: {
	actor: Actor<ConsoleActor | MissionControlActor>;
	proposalId: bigint;
}) => {
	const { init_asset_upload, commit_asset_upload, upload_asset_chunk } = actor;

	const file = await init_asset_upload(
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
