import { PrincipalSchema } from '@junobuild/functions';
import * as z from 'zod';

const defineQuery = <T>(definition: T) => ({ ...definition, type: 'query' });

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
