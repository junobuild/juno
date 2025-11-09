import { assertNonNullish } from '@dfinity/utils';
import { defineHook, type OnDeleteAsset } from '@junobuild/functions';

/* eslint-disable no-console */

export const onDeleteAsset = defineHook<OnDeleteAsset>({
	collections: ['test-on-delete-asset'],
	run: async ({ data }) => {
		console.log('onDeleteAsset called');

		const asset = data;

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
