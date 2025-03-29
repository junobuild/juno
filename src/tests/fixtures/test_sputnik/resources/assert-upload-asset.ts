import type { AssertUploadAsset, AssertUploadAssetContext } from '@junobuild/functions';
import { defineAssert } from '@junobuild/functions';

/* eslint-disable no-console */

const onAssertUploadAssetDemo = (context: AssertUploadAssetContext) => {
	if (context.data.batch.key.name === 'test.html') {
		throw new Error('test.html name not allowed');
	}
};

export const assertUploadAsset = defineAssert<AssertUploadAsset>({
	collections: ['test-assert-upload-asset'],
	assert: (context) => {
		console.log('assertUploadAsset called');

		switch (context.data.batch.key.collection) {
			case 'test-assert-upload-asset':
				onAssertUploadAssetDemo(context);
				break;
		}
	}
});

/* eslint-enable */
