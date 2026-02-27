import { RawPrincipalSchema } from '@junobuild/functions';
import * as z from 'zod';

const defineQuery = <T>(definition: T) => ({ ...definition, type: 'query' });

const InputSchema = z.object({
	value: RawPrincipalSchema
});

type Input = z.infer<typeof InputSchema>;

export const hello_world = defineQuery({
	input: InputSchema,
	handler: (input: Input) => {
		console.log('Hello world', input.value);
	}
});
