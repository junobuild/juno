import type { OnSetDocContext } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import { countAssetsStore, countCollectionAssetsStore } from '@junobuild/functions/sdk';
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
		collection: 'demo-countdocs',
		params: listParams({ caller })
	});

	// eslint-disable-next-line no-console
	console.log('Count:', count);
};
