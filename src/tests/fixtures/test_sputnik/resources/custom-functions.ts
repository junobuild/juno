import { assertNonNullish } from '@dfinity/utils';
import { defineQuery, defineUpdate } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import { decodeDocData, encodeDocData, getDocStore, setDocStore } from '@junobuild/functions/sdk';
import { j } from '@junobuild/schema';

/* eslint-disable no-console, require-await */

const ArgsSchema = j.object({
	value: j.principal()
});

type Args = j.infer<typeof ArgsSchema>;

const ResultSchema = j.object({
	value: j.principal(),
	text: j.string()
});

export const helloWorld = defineQuery({
	args: ArgsSchema,
	result: ResultSchema,
	handler: (input: Args) => {
		console.log('Hello world');
		return { value: input.value, text: 'Welcome' };
	}
});

const WelcomeArgsSchema = j.object({
	value: j.string()
});

type WelcomeArgs = j.infer<typeof WelcomeArgsSchema>;

const WelcomeResultSchema = j.object({
	caller: j.principal(),
	value: j.bigint()
});

export const welcome = defineUpdate(() => ({
	args: WelcomeArgsSchema,
	result: WelcomeResultSchema,
	handler: async (input: WelcomeArgs) => {
		console.log('Welcome async', input);
		return { caller: id(), value: 123n };
	}
}));

export const welcome_without_args = defineUpdate({
	result: WelcomeResultSchema,
	handler: async () => {
		console.log('Welcome async');
		return { caller: id(), value: 123n };
	}
});

export const yolo = defineUpdate({
	handler: async () => {
		console.log('No args, no result, no problem');
	}
});

export const syncUpdate = defineUpdate({
	handler: () => {
		console.log('Sync update, no args, no result');
	}
});

export const queryNoArgs = defineQuery({
	result: ResultSchema,
	handler: () => {
		console.log('Query no args');
		return { value: id(), text: 'No args' };
	}
});

export const queryNoArgsNoResult = defineQuery({
	handler: () => {
		console.log('Query no args no result');
	}
});

export const asyncQuery = defineQuery({
	args: ArgsSchema,
	result: ResultSchema,
	handler: async (input: Args) => {
		console.log('Async query');
		return { value: input.value, text: 'Async' };
	}
});

export const updateArgsOnly = defineUpdate({
	args: WelcomeArgsSchema,
	handler: async (input: WelcomeArgs) => {
		console.log('Update args only', input);
	}
});

export const setDocTest = defineUpdate({
	args: j.strictObject({ key: j.string(), collection: j.string(), value: j.bigint() }),
	handler: ({ value, key, collection }) => {
		const updatedData = encodeDocData({
			value: value + 2n
		});

		setDocStore({
			caller: id(),
			collection,
			key,
			doc: {
				data: updatedData
			}
		});
	}
});

const ReadDocTestResultSchema = j.strictObject({ value: j.bigint() });

export const readDocTest = defineQuery({
	args: j.strictObject({ key: j.string(), collection: j.string() }),
	result: ReadDocTestResultSchema,
	handler: ({ key, collection }) => {
		const doc = getDocStore({
			caller: id(),
			key,
			collection
		});

		assertNonNullish(doc);
		assertNonNullish(doc?.data);

		const readData = decodeDocData<j.infer<typeof ReadDocTestResultSchema>>(doc.data);
		return { value: readData.value };
	}
});

/* eslint-enable */
