import {
	type AssertSetDoc,
	type AssertSetDocContext,
	defineAssert,
	defineHook,
	type OnSetDoc,
	type OnSetDocContext
} from '@junobuild/functions';
import { decodeDocData } from '@junobuild/functions/sdk';
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

export const assertSetDoc = defineAssert<AssertSetDoc>({
	collections: ['demo', 'console'],
	assert: (context) => {
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

const onSetDocDemo = async (context: OnSetDocContext) => {
	console.log('onSetDoc:', context.data.key);
};

export const onSetDoc = defineHook<OnSetDoc>({
	collections: ['demo-onsetdoc'],
	run: async (context) => {
		switch (context.data.collection) {
			case 'demo-onsetdoc':
				await onSetDocDemo(context);
				break;
		}
	}
});
