import type { OnSetDocContext } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import {
	decodeDocData,
	deleteDocStore,
	encodeDocData,
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

	setDocStore({
		// TODO: a test for this too?
		caller: id(),
		collection: context.data.collection,
		key: context.data.key,
		doc: {
			version: context.data.data.after.version,
			data: encodedData
		}
	});
};

export const testSdkDeleteDocStore = async ({
	caller,
	data: { collection, key, data }
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	deleteDocStore({
		caller,
		collection,
		key,
		doc: {
			version: data.after.version
		}
	});
};
