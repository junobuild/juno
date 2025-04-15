import { assertNonNullish, jsonReplacer } from '@dfinity/utils';
import type { OnSetDocContext } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import {
	countCollectionDocsStore,
	countDocsStore,
	decodeDocData,
	deleteDocsStore,
	deleteDocStore,
	encodeDocData,
	getDocStore,
	listDocsStore,
	setDocStore
} from '@junobuild/functions/sdk';
import type { SputnikMock, SputnikTestListDocs } from '../../../../mocks/sputnik.mocks';

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

export const testSdkListDocsStore = async ({
	caller,
	data: { collection, key, data }
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const result = listDocsStore({
		caller: id(),
		collection: 'demo-listdocs',
		params: {
			matcher: {
				key: 'key-match',
				description: 'desc-match'
			},
			owner: caller,
			order: {
				desc: true,
				field: 'created_at'
			},
			paginate: {
				start_after: undefined,
				limit: 10n
			}
		}
	});

	for (const [key, item] of result.items) {
		// eslint-disable-next-line no-console
		console.log(
			`${key} / ${item.description ?? ''}: ${JSON.stringify(decodeDocData(item.data), jsonReplacer)}`
		);
	}

	setDocStore({
		caller,
		collection,
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
export const testSdkCountCollectionDocsStore = async () => {
	const count = countCollectionDocsStore({
		collection: 'demo-countcollectiondocs'
	});

	// eslint-disable-next-line no-console
	console.log('Count:', count);
};

export const testSdkCountDocsStore = async ({
	caller
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const count = countDocsStore({
		caller: id(),
		collection: 'demo-countdocs',
		params: {
			matcher: {
				key: 'key-match',
				description: 'desc-match'
			},
			owner: caller,
			order: {
				desc: true,
				field: 'created_at'
			},
			paginate: {
				start_after: undefined,
				limit: 10n
			}
		}
	});

	// eslint-disable-next-line no-console
	console.log('Count:', count);
};

// eslint-disable-next-line require-await
export const testSdkDeleteDocsStore = async () => {
	deleteDocsStore({
		collection: 'demo-deletedocs'
	});
};
