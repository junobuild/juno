import { assertNonNullish } from '@dfinity/utils';
import { defineHook, type OnDeleteFilteredAssets } from '@junobuild/functions';

/* eslint-disable no-console */

export const onDeleteFilteredAssets = defineHook<OnDeleteFilteredAssets>({
	collections: ['test-on-delete-filtered-assets'],
	run: async ({ data }) => {
		console.log('onDeleteFilteredAssets called');

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
