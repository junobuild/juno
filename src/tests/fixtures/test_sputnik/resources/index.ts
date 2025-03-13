import { type AssertSetDocContext, decodeDocData, defineAssert } from '@junobuild/functions';

const onAssertSetDocConsole = (context: AssertSetDocContext) => {
	console.log('Log:', context.data.key);
	console.info('Info:', context.data.key);
	console.warn('Warn:', context.data.key);
	console.error('Error:', context.data.key);
};

const onAssertSetDocDemo = (context: AssertSetDocContext) => {
	decodeDocData;
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
