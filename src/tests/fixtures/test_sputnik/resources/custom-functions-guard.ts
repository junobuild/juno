import { defineQuery, defineUpdate } from '@junobuild/functions';
import {
	callerHasWritePermission,
	callerIsAccessKey,
	callerIsAdmin
} from '@junobuild/functions/sdk';
import { j } from '@junobuild/schema';

/* eslint-disable no-console */

const ArgsSchema = j.object({
	value: j.principal()
});

type Args = j.infer<typeof ArgsSchema>;

const ResultSchema = j.object({
	value: j.principal(),
	text: j.string()
});

export const onlyAdmin = defineQuery({
	guard: callerIsAdmin,
	args: ArgsSchema,
	result: ResultSchema,
	handler: (input: Args) => {
		console.log('Hello admin');
		return { value: input.value, text: 'Welcome' };
	}
});

export const adminOrWriter = defineQuery({
	guard: callerHasWritePermission,
	handler: () => {
		console.log('Hello write');
	}
});

export const adminOrWriterOrSubmit = defineUpdate({
	guard: callerIsAccessKey,
	handler: () => {
		console.log('Hello submit');
	}
});

export const customGuard = defineUpdate({
	guard: () => {
		throw new Error('Not allowed with a custom guard');
	},
	handler: () => {
		console.log('Hello custom');
	}
});
