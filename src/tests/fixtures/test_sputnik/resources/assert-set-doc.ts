/* eslint-disable no-console */

import { type AssertSetDoc, type AssertSetDocContext, defineAssert } from '@junobuild/functions';
import { mockSputnikObj } from '../../../mocks/sputnik.mocks';

const onAssertSetDocConsole = (context: AssertSetDocContext) => {
	console.log('Log:', context.data.key);
	console.info('Info:', context.data.key);
	console.warn('Warn:', context.data.key);
	console.error('Error:', context.data.key);

	console.log('Log and serialize:', mockSputnikObj);
};

const onAssertSetDocDemo = (context: AssertSetDocContext) => {
	console.log('Asserting data for', context.data.key);
};

// TODO: test an assertion using zod

export const assertSetDoc = defineAssert<AssertSetDoc>({
	collections: ['test-assert', 'test-console'],
	assert: (context) => {
		switch (context.data.collection) {
			case 'test-assert':
				onAssertSetDocDemo(context);
				break;
			case 'test-console':
				onAssertSetDocConsole(context);
				break;
		}
	}
});

/* eslint-enable */
