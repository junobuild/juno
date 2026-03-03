import { PrincipalSchema } from '@junobuild/functions';
import * as z from 'zod';

const defineQuery = <T>(definition: T) => ({ ...definition, type: 'query' });

const InputSchema = z.object({
	value: PrincipalSchema
});

type Input = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
	value: PrincipalSchema,
	text: z.string()
});

type Output = z.infer<typeof OutputSchema>;

export const hello_world = defineQuery({
	input: InputSchema,
	output: OutputSchema,
	handler: (input: Input) => {
		console.log('Hello world', input.value);
		return { value: input.value, text: 'Welcome' };
	}
});
