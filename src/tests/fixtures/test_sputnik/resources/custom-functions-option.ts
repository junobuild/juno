import { defineQuery, PrincipalSchema, Uint8ArraySchema } from '@junobuild/functions';
import { id as satelliteId } from '@junobuild/functions/ic-cdk';
import * as z from 'zod';

const DemoAntonioArgsSchema = z.strictObject({
	// test: the JsonData macro needs to handle option for special types as well
	id: PrincipalSchema.optional(),
	sub: z.strictObject({
		arr: Uint8ArraySchema
	})
});

const DemoAntonioResultSchema = z.strictObject({
	world: z.string(),
	id: PrincipalSchema.optional(),
	sub: z.strictObject({
		value: z.bigint().optional(),
		arr: Uint8ArraySchema.optional()
	})
});

export const demoAntonio = defineQuery({
	args: DemoAntonioArgsSchema,
	result: DemoAntonioResultSchema,
	handler: ({ id }) => ({
		world: `${id?.toText() ?? ''} - ${satelliteId().toText()}`,
		id: satelliteId(),
		sub: {
			value: 123n,
			arr: Uint8Array.from([5, 6, 7])
		}
	})
});
