/* eslint-disable no-console */

import { type AssertSetDoc, type AssertSetDocContext, defineAssert } from '@junobuild/functions';
import { decodeDocData } from '@junobuild/functions/sdk';
import { mockSputnikObj, type SputnikMock, SputnikMockSchema } from '../../../mocks/sputnik.mocks';

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

const onAssertZod = ({
	data: {
		data: {
			proposed: { data }
		}
	}
}: AssertSetDocContext) => {
	const proposedData = decodeDocData<SputnikMock>(data);
	console.log('Asserting with Zod:', SputnikMockSchema.safeParse(proposedData).success);
};

// TODO: test an assertion using zod

export const assertSetDoc = defineAssert<AssertSetDoc>({
	collections: ['test-assert', 'test-console', 'test-zod'],
	assert: (context) => {
		switch (context.data.collection) {
			case 'test-assert':
				onAssertSetDocDemo(context);
				break;
			case 'test-console':
				onAssertSetDocConsole(context);
				break;
			case 'test-zod':
				onAssertZod(context);
				break;
		}
	}
});

/* eslint-enable */
