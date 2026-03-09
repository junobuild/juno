import { defineQuery, PrincipalSchema } from '@junobuild/functions';
import { id as satelliteId } from '@junobuild/functions/ic-cdk';
import * as z from 'zod';

const DemoAntonioArgsSchema = z.strictObject({
	// TODO: bug OptionPrincipal
	id: PrincipalSchema.optional()
});

const DemoAntonioResultSchema = z.strictObject({
	world: z.string()
});

export const demoAntonio = defineQuery({
	args: DemoAntonioArgsSchema,
	result: DemoAntonioResultSchema,
	handler: ({ id }) => {
		return {
			world: `${id?.toText() ?? ''} - ${satelliteId().toText()}`
		};
	}
});
