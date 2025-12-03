import type { SatelliteActor, SatelliteDid } from '$declarations';
import type { Actor } from '@dfinity/pic';
import { arrayBufferToUint8Array, toNullable } from '@dfinity/utils';
import { nanoid } from 'nanoid';
import { mockBlob } from '../mocks/storage.mocks';

export const uploadAsset = async ({
	full_path,
	description,
	name,
	collection,
	actor,
	headers = [],
	token,
	encoding_type = []
}: {
	full_path: string;
	description?: string;
	name: string;
	collection: string;
	actor: Actor<SatelliteActor>;
	headers?: [string, string][];
	token?: string;
	encoding_type?: [] | [string];
}) => {
	const { commit_asset_upload, upload_asset_chunk, init_asset_upload } = actor;

	const file = await init_asset_upload({
		collection,
		description: toNullable(description),
		encoding_type,
		full_path,
		name,
		token: toNullable(token)
	});

	const chunk = await upload_asset_chunk({
		batch_id: file.batch_id,
		content: arrayBufferToUint8Array(await mockBlob.arrayBuffer()),
		order_id: [0n]
	});

	await commit_asset_upload({
		batch_id: file.batch_id,
		chunk_ids: [chunk.chunk_id],
		headers
	});
};

export const uploadAssetWithToken = async ({
	collection,
	headers,
	actor
}: {
	collection: string;
	headers?: [string, string][];
	actor: Actor<SatelliteActor>;
}): Promise<{ fullPathWithToken: string; fullPath: string }> => {
	const name = `hello-${nanoid()}.html`;
	const full_path = `/${collection}/${name}`;
	const token = nanoid();

	await uploadAsset({
		full_path,
		name,
		collection,
		token,
		headers,
		actor
	});

	return { fullPathWithToken: `${full_path}?token=${token}`, fullPath: full_path };
};

export const assertHttpRequestCode = async ({
	url,
	code,
	actor
}: {
	url: string;
	code: 200 | 404;
	actor: Actor<SatelliteActor>;
}) => {
	const { http_request } = actor;

	const request: SatelliteDid.HttpRequest = {
		body: Uint8Array.from([]),
		certificate_version: toNullable(2),
		headers: [],
		method: 'GET',
		url
	};

	const response = await http_request(request);

	const { status_code } = response;

	expect(status_code).toEqual(code);
};
