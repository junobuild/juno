import { assertNonNullish } from '@dfinity/utils';
import { defineHook, type OnDeleteManyAssets } from '@junobuild/functions';

/* eslint-disable no-console */

export const onDeleteManyAssets = defineHook<OnDeleteManyAssets>({
	collections: ['test-on-delete-many-assets'],
	run: async ({ data }) => {
		console.log('onDeleteManyAssets called');

		const [asset] = data;

		assertNonNullish(asset);

		if (asset.key.name === 'test.html') {
			// eslint-disable-next-line require-await
			const thr = async () => {
				throw new Error('test-async-and-trap');
			};

			await thr();
			return;
		}
	}
});

/* eslint-enable */
