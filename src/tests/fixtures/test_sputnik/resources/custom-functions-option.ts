import { defineQuery } from '@junobuild/functions';
import { id as satelliteId } from '@junobuild/functions/ic-cdk';
import { j } from '@junobuild/schema';

const DemoAntonioArgsSchema = j.strictObject({
	// test: the JsonData macro needs to handle option for special types as well
	id: j.principal().optional(),
	sub: j.strictObject({
		arr: j.uint8Array()
	})
});

const DemoAntonioResultSchema = j.strictObject({
	world: j.string(),
	id: j.principal().optional(),
	sub: j.strictObject({
		value: j.bigint().optional(),
		arr: j.uint8Array().optional()
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

// Assertion which would make the npm run build:test-sputnik fail

export const testQuery2 = defineQuery({
	result: j.strictObject({
		// Issue: optional enum fields incorrectly emitted #[json_data(nested)] because
		// needsJsonData was not forwarded when wrapping a composite type in opt.
		role: j.enum(['admin', 'user'] as const).optional()
	}),
	handler: () => ({
		role: undefined
	})
});
