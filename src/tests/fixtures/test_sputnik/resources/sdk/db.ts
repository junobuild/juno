import { assertNonNullish, jsonReplacer } from '@dfinity/utils';
import type { OnSetDocContext } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import {
	decodeDocData,
	deleteDocStore,
	encodeDocData,
	getDocStore,
	setDocStore
} from '@junobuild/functions/sdk';
import type { SputnikMock } from '../../../../mocks/sputnik.mocks';

// eslint-disable-next-line require-await
export const testSdkSetDocStore = async (context: OnSetDocContext) => {
	const sourceData = decodeDocData<SputnikMock>(context.data.data.after.data);

	const updateData = {
		...sourceData,
		value: `${sourceData.value} (updated)`
	};

	const encodedData = encodeDocData(updateData);

	const result = setDocStore({
		caller: id(),
		collection: context.data.collection,
		key: context.data.key,
		doc: {
			version: context.data.data.after.version,
			data: encodedData
		}
	});

	const {
		data: { before, after }
	} = result;

	assertNonNullish(before);

	assertNonNullish(before.version);
	assertNonNullish(after.version);

	if (after.version !== before.version + 1n) {
		throw new Error('Version should have been incremented.');
	}
};

export const testSdkDeleteDocStore = async ({
	caller,
	data: { collection, key, data }
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const result = deleteDocStore({
		caller,
		collection,
		key,
		doc: {
			version: data.after.version
		}
	});

	assertNonNullish(result.data);
};

export const testSdkGetDocStore = async ({
	caller,
	data: { collection, key, data }
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const hookData = decodeDocData<SputnikMock>(data.after.data);

	const doc = getDocStore({
		caller,
		key,
		collection
	});

	assertNonNullish(doc?.data);

	const readData = decodeDocData<SputnikMock>(doc.data);

	if (JSON.stringify(hookData, jsonReplacer) !== JSON.stringify(readData, jsonReplacer)) {
		throw new Error('Hook and read data are not equals.');
	}

	if (doc?.version !== data.after.version) {
		throw new Error('Hook and read version are not equals.');
	}

	const updatedData = encodeDocData({
		...readData,
		value: 'Validated'
	});

	setDocStore({
		caller: id(),
		collection,
		key,
		doc: {
			version: doc.version,
			data: updatedData
		}
	});
};
