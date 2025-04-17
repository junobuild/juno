import { arrayBufferToUint8Array } from '@dfinity/utils';
import type { AssetKey, HeaderFields, OnSetDocContext } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import {
	countAssetsStore,
	countCollectionAssetsStore,
	decodeDocData,
	deleteAssetsStore,
	deleteAssetStore,
	deleteFilteredAssetsStore,
	setAssetHandler
} from '@junobuild/functions/sdk';
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
