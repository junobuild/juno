import { defineHook, type OnUploadAsset } from '@junobuild/functions';

/* eslint-disable no-console */

export const onUploadAsset = defineHook<OnUploadAsset>({
	collections: ['test-on-upload-asset'],
	run: async ({ data }) => {
		console.log('onUploadAsset called');

		const asset = data;

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
