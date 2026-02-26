import { Principal } from '@icp-sdk/core/principal';
import * as z from 'zod';

const defineQuery = <T>(definition: T) => ({ ...definition, type: 'query' });

const InputSchema = z.object({
	value: Principal
})

export const world_world = defineQuery({
	input: InputSchema,
	handler: (input: Principal) => {
		console.log('Hello world', input.toText());
	}
});
