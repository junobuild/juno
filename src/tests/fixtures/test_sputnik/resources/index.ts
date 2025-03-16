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
import { decodeDocData, encodeDocData, setDocStore } from '@junobuild/functions/sdk';
import { mockSputnikObj, type SputnikMock } from '../../../mocks/sputnik.mocks';

const onAssertSetDocConsole = (context: AssertSetDocContext) => {
	// eslint-disable-next-line no-console
	console.log('Log:', context.data.key);
	// eslint-disable-next-line no-console
	console.info('Info:', context.data.key);
	console.warn('Warn:', context.data.key);
	console.error('Error:', context.data.key);

	// eslint-disable-next-line no-console
	console.log('Log and serialize:', mockSputnikObj);
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

// eslint-disable-next-line require-await
const onSetDocDemo = async (context: OnSetDocContext) => {
	// eslint-disable-next-line no-console
	console.log('onSetDoc:', context.data.key);
};

// eslint-disable-next-line require-await
const onSetIcCdkId = async (_context: OnSetDocContext) => {
	// eslint-disable-next-line no-console
	console.log('Satellite ID:', id().toText());
	// eslint-disable-next-line no-console
	console.log('Satellite ID is principal:', id() instanceof Principal);
	// eslint-disable-next-line no-console
	console.log('Satellite ID is anonymous:', id().isAnonymous());
};

const onSetDocUpdate = async (context: OnSetDocContext) => {
	const sourceData = decodeDocData<SputnikMock>(context.data.data.after.data);

	const updateData = {
		...sourceData,
		value: `${sourceData.value} (updated)`
	};

	const encodedData = encodeDocData(updateData);

	setDocStore({
		// TODO: can we get a better stacktrace if owner is allowed?
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

export const onSetDoc = defineHook<OnSetDoc>({
	collections: ['demo-onsetdoc', 'demo-ic-cdk-id', 'demo-update'],
	run: async (context) => {
		const fn: Record<Collection, RunFunction<OnSetDocContext>> = {
			'demo-onsetdoc': onSetDocDemo,
			'demo-ic-cdk-id': onSetIcCdkId,
			'demo-update': onSetDocUpdate
		};

		await fn[context.data.collection]?.(context);
	}
});
