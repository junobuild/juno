import { assertNonNullish } from '@dfinity/utils';
import { defineQuery, defineUpdate, PrincipalSchema } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import { decodeDocData, encodeDocData, getDocStore, setDocStore } from '@junobuild/functions/sdk';
import * as z from 'zod';

/* eslint-disable no-console, require-await */

const ArgsSchema = z.object({
	value: PrincipalSchema
});

type Args = z.infer<typeof ArgsSchema>;

const ResultSchema = z.object({
	value: PrincipalSchema,
	text: z.string()
});

export const helloWorld = defineQuery({
	args: ArgsSchema,
	result: ResultSchema,
	handler: (input: Args) => {
		console.log('Hello world');
		return { value: input.value, text: 'Welcome' };
	}
});

const WelcomeArgsSchema = z.object({
	value: z.string()
});

type WelcomeArgs = z.infer<typeof WelcomeArgsSchema>;

const WelcomeResultSchema = z.object({
	caller: PrincipalSchema,
	value: z.bigint()
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
	args: z.strictObject({ key: z.string(), collection: z.string(), value: z.bigint() }),
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

const ReadDocTestResultSchema = z.strictObject({ value: z.bigint() });

export const readDocTest = defineQuery({
	args: z.strictObject({ key: z.string(), collection: z.string() }),
	result: ReadDocTestResultSchema,
	handler: ({ key, collection }) => {
		const doc = getDocStore({
			caller: id(),
			key,
			collection
		});

		assertNonNullish(doc);
		assertNonNullish(doc?.data);

		const readData = decodeDocData<z.infer<typeof ReadDocTestResultSchema>>(doc.data);
		return { value: readData.value };
	}
});

/* eslint-enable */
