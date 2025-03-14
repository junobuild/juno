import { type AssertSetDocContext, decodeDocData, defineAssert } from '@junobuild/functions';
import { mockObj } from '../../../mocks/sputnik.mocks';

const onAssertSetDocConsole = (context: AssertSetDocContext) => {
	// eslint-disable-next-line no-console
	console.log('Log:', context.data.key);
	// eslint-disable-next-line no-console
	console.info('Info:', context.data.key);
	console.warn('Warn:', context.data.key);
	console.error('Error:', context.data.key);

	// eslint-disable-next-line no-console
	console.log('Log and serialize:', mockObj);
};

const onAssertSetDocDemo = (context: AssertSetDocContext) => {
	decodeDocData;
	// eslint-disable-next-line no-console
	console.log('Asserting data for', context.data.key);
};

export const assertSetDoc = defineAssert({
	collections: ['demo', 'console'],
	assertSetDoc: (context: AssertSetDocContext) => {
		switch (context.data.collection) {
			case 'demo':
				onAssertSetDocDemo(context);
				break;
			case 'console':
				onAssertSetDocConsole(context);
				break;
		}
	}
});
