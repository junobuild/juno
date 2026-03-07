import { defineQuery, defineUpdate, PrincipalSchema } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
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

/* eslint-enable */
