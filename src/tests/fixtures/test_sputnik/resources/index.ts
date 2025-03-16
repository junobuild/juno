import { Principal } from '@dfinity/principal';
import {
	type AssertSetDoc,
	type AssertSetDocContext,
	type Collection,
	defineAssert,
	defineHook,
	type OnSetDoc,
	type OnSetDocContext,
	type RunFunction
} from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
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

const onSetIcCdkId = async (_context: OnSetDocContext) => {
	console.log('Satellite ID:', id().toText());
	console.log('Satellite ID is principal:', id() instanceof Principal);
	console.log('Satellite ID is not anonymous:', id().isAnonymous());
};

export const onSetDoc = defineHook<OnSetDoc>({
	collections: ['demo-onsetdoc', 'demo-ic-cdk-id'],
	run: async (context) => {
		const fn: Record<Collection, RunFunction<OnSetDocContext>> = {
			'demo-onsetdoc': onSetDocDemo,
			'demo-ic-cdk-id': onSetIcCdkId
		};

		await fn[context.data.collection]?.(context);
	}
});
