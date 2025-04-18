import { arrayBufferToUint8Array, assertNonNullish, isNullish } from '@dfinity/utils';
import type { AssetKey, HeaderFields, OnSetDocContext } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import {
	countAssetsStore,
	countCollectionAssetsStore,
	decodeDocData,
	deleteAssetsStore,
	deleteAssetStore,
	deleteFilteredAssetsStore,
	encodeDocData,
	getAssetStore,
	getContentChunksStore,
	listAssetsStore,
	setAssetHandler,
	setDocStore
} from '@junobuild/functions/sdk';
import type { SputnikTestListDocs } from '../../../../mocks/sputnik.mocks';
import { mockBlob } from '../../../../mocks/storage.mocks';
import { listParams } from './utils';

// eslint-disable-next-line require-await
export const testSdkCountCollectionAssetsStore = async () => {
	const count = countCollectionAssetsStore({
		collection: 'demo-countcollectionassets'
	});

	// eslint-disable-next-line no-console
	console.log('Count:', count);
};

export const testSdkCountAssetsStore = async ({
	caller
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const count = countAssetsStore({
		caller: id(),
		collection: 'demo-countassets',
		params: listParams({ caller })
	});

	// eslint-disable-next-line no-console
	console.log('Count:', count);
};

export const testSdkSetAssetHandler = async () => {
	const collection = 'demo-setassethandler';
	const name = 'hello.html';
	const full_path = `/${collection}/${name}`;

	const key: AssetKey = {
		name,
		full_path,
		collection,
		owner: id().toUint8Array()
	};

	const headers: HeaderFields = [['content-type', 'text/html']];

	const content = arrayBufferToUint8Array(await mockBlob.arrayBuffer());

	setAssetHandler({
		key,
		headers,
		content
	});
};

export const testSdkDeleteAssetStore = async ({
	caller,
	data: { data }
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const fullPath = decodeDocData<string>(data.after.data);

	deleteAssetStore({
		caller,
		collection: 'demo-deleteasset',
		full_path: fullPath
	});
};

// eslint-disable-next-line require-await
export const testSdkDeleteAssetsStore = async () => {
	deleteAssetsStore({
		collection: 'demo-deleteassets'
	});
};

export const testSdkDeleteFilteredAssetsStore = async ({
	caller
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const result = deleteFilteredAssetsStore({
		caller: id(),
		collection: 'demo-deletefilteredassets',
		params: listParams({ caller })
	});

	// eslint-disable-next-line no-console
	console.log('Count:', result.length);
};

export const testSdkGetAssetStore = async ({
	caller,
	data: { data }
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const fullPath = decodeDocData<string>(data.after.data);

	const asset = getAssetStore({
		caller,
		collection: 'demo-getasset',
		full_path: fullPath
	});

	// eslint-disable-next-line no-console
	console.log('Nullish:', isNullish(asset));
};

export const testSdkListAssetsStore = async ({
	caller,
	data: { key, data }
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const result = listAssetsStore({
		caller: id(),
		collection: 'demo-listassets',
		params: listParams({ caller })
	});

	for (const [key, item] of result.items) {
		// eslint-disable-next-line no-console
		console.log(`${key}: ${item.key.full_path}`);
	}

	setDocStore({
		caller,
		collection: 'demo-listassets',
		key,
		doc: {
			version: data.after.version,
			data: encodeDocData<SputnikTestListDocs>({
				items_length: result.items_length,
				items_page: result.items_page,
				matches_length: result.matches_length,
				matches_pages: result.matches_pages
			})
		}
	});
};

// eslint-disable-next-line require-await
export const testSdkGetContentChunksStore = async ({ caller }: OnSetDocContext) => {
	const asset = getAssetStore({
		caller,
		collection: 'demo-getchunks',
		full_path: '/demo-getchunks/hello.html'
	});

	assertNonNullish(asset);

	const encoding = asset.encodings.find(([key, _]) => key === 'identity');

	assertNonNullish(encoding);

	const chunk = getContentChunksStore({
		encoding: encoding[1],
		chunk_index: 0n,
		memory: 'stable'
	});

	const decoder = new TextDecoder();
	const responseBody = decoder.decode(chunk);

	// eslint-disable-next-line no-console
	console.log('Chunk:', responseBody);
};
