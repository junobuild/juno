import { Principal } from '@dfinity/principal';
import {
	type AssertSetDoc,
	type AssertSetDocContext,
	decodeDocData,
	defineAssert,
	defineHook,
	encodeDocData,
	type OnSetDoc,
	type OnSetDocContext,
	setDocStore
} from '@junobuild/functions';
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

// TODO: test assertion reject with Zod

const onSetDocDemo = async (context: OnSetDocContext) => {
	console.log('onSetDoc:', context.data.key);
};

const onSetDocUpdate = async (context: OnSetDocContext) => {
	const sourceData = decodeDocData<SputnikMock>(context.data.data.after.data);

	const updateData = {
		...sourceData,
		value: `${sourceData.value} (updated)`
	};

	const encodedData = encodeDocData(updateData);

	setDocStore({
		caller: Principal.anonymous().toUint8Array(),
		collection: context.data.collection,
		doc: {
			key: context.data.key,
			data: encodedData
		}
	});
};

export const onSetDoc = defineHook<OnSetDoc>({
	collections: ['demo-onsetdoc', 'update'],
	run: async (context) => {
		switch (context.data.collection) {
			case 'demo-onsetdoc':
				await onSetDocDemo(context);
				break;
			case 'update':
				await onSetDocUpdate(context);
				break;
		}
	}
});
