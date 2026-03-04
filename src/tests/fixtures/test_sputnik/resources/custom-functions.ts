import { PrincipalSchema } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';
import * as z from 'zod';

const defineQuery = <T>(definition: T) => ({ ...definition, type: 'query' });
const defineUpdate = <T>(definition: T) => ({ ...definition, type: 'updated' });

const ArgsSchema = z.object({
	value: PrincipalSchema
});

type Args = z.infer<typeof ArgsSchema>;

const ResultSchema = z.object({
	value: PrincipalSchema,
	text: z.string()
});

type Result = z.infer<typeof ResultSchema>;

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

type WelcomeArgs = z.infer<typeof ArgsSchema>;

const WelcomeResultSchema = z.object({
	caller: PrincipalSchema,
	value: z.bigint()
});

export const welcome = defineUpdate({
	// args: WelcomeArgsSchema,
	result: WelcomeResultSchema,
	handler: async (input: WelcomeArgs) => {
		console.log('Welcome async', input);
		return { caller: id(), value: 123n };
	}
});
