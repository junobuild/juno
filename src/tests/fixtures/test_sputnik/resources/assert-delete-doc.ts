import { isNullish } from '@dfinity/utils';
import {
	type AssertDeleteDoc,
	type AssertDeleteDocContext,
	defineAssert
} from '@junobuild/functions';
import { decodeDocData } from '@junobuild/functions/sdk';
import type { SputnikValueMock } from '../../../mocks/sputnik.mocks';

/* eslint-disable no-console */

const onAssertDeleteDocDemo = (context: AssertDeleteDocContext) => {
	if (isNullish(context.data.data.current)) {
		console.log('Document does not exist');
		return;
	}

	const { value } = decodeDocData<SputnikValueMock>(context.data.data.current.data);

	if (value === 'test') {
		throw new Error('test keyword not allowed');
	}
};

/* eslint-enable */

export const assertDeleteDoc = defineAssert<AssertDeleteDoc>({
	collections: ['test-delete-assert'],
	assert: (context) => {
		console.log('assertDeleteDoc called');

		switch (context.data.collection) {
			case 'test-delete-assert':
				onAssertDeleteDocDemo(context);
				break;
		}
	}
});
