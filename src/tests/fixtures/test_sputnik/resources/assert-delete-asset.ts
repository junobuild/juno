import type { AssertDeleteAsset, AssertDeleteAssetContext } from '@junobuild/functions';
import { defineAssert } from '@junobuild/functions';

/* eslint-disable no-console */

const onAssertDeleteAssetDemo = (context: AssertDeleteAssetContext) => {
	if (context.data.key.name === 'test.html') {
		throw new Error('test.html name not allowed');
	}
};

export const assertDeleteAsset = defineAssert<AssertDeleteAsset>({
	collections: ['test-delete-assert-asset'],
	assert: (context) => {
		console.log('assertDeleteAsset called');

		switch (context.data.key.collection) {
			case 'test-delete-assert-asset':
				onAssertDeleteAssetDemo(context);
				break;
		}
	}
});

/* eslint-enable */
