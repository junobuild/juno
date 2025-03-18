/* eslint-disable require-await, no-console */

import { Principal } from '@dfinity/principal';
import {
	type AssertSetDoc,
	type AssertSetDocContext,
	defineAssert,
	defineHook,
	type OnSetDoc,
	type OnSetDocContext,
	type RunFunction
} from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import { decodeDocData, encodeDocData, setDocStore } from '@junobuild/functions/sdk';
import { mockSputnikObj, type SputnikMock } from '../../../mocks/sputnik.mocks';
import { onTestIcCdkCall } from './on-set-ic-cdk-call';
import { onTestTextEncoding } from './text-encoding';

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

const onTestSetDoc = async (context: OnSetDocContext) => {
	console.log('onSetDoc:', context.data.key);
};

const onTestIcCdkId = async (_context: OnSetDocContext) => {
	console.log('Satellite ID:', id().toText());

	console.log('Satellite ID is principal:', id() instanceof Principal);

	console.log('Satellite ID is anonymous:', id().isAnonymous());
};

const onTestDocUpdate = async (context: OnSetDocContext) => {
	const sourceData = decodeDocData<SputnikMock>(context.data.data.after.data);

	const updateData = {
		...sourceData,
		value: `${sourceData.value} (updated)`
	};

	const encodedData = encodeDocData(updateData);

	setDocStore({
		// TODO: a test for this too?
		caller: id(),
		collection: context.data.collection,
		doc: {
			key: context.data.key,
			version: context.data.data.after.version,
			data: encodedData
		}
	});
};

const collections = [
	'test-onsetdoc',
	'test-ic-cdk-id',
	'test-ic-cdk-call',
	'test-update',
	'test-textencoding'
] as const;

type OnSetDocCollection = (typeof collections)[number];

export const onSetDoc = defineHook<OnSetDoc>({
	collections,
	run: async (context) => {
		const fn: Record<OnSetDocCollection, RunFunction<OnSetDocContext>> = {
			'test-onsetdoc': onTestSetDoc,
			'test-ic-cdk-id': onTestIcCdkId,
			'test-update': onTestDocUpdate,
			'test-ic-cdk-call': onTestIcCdkCall,
			'test-textencoding': onTestTextEncoding
		};

		await fn[context.data.collection as OnSetDocCollection]?.(context);
	}
});

/* eslint-enable */
