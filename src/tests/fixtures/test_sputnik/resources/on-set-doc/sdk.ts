import type { OnSetDocContext } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import { decodeDocData, encodeDocData, setDocStore } from '@junobuild/functions/sdk';
import type { SputnikMock } from '../../../../mocks/sputnik.mocks';

// eslint-disable-next-line require-await
export const testDocUpdate = async (context: OnSetDocContext) => {
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
		doc: {
			key: context.data.key,
			version: context.data.data.after.version,
			data: encodedData
		}
	});
};
