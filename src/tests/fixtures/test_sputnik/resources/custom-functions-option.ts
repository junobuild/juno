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

const PreferencesSchema = j.strictObject({
	theme: j.string()
});

export const testQuery = defineQuery({
	result: j.strictObject({
		// Issue: Option<nested struct> fields with #[json_data(nested)] generated `.into()`
		// instead of `.map(|v| v.into())`, causing a missing From trait bound at compile time.
		preferences: PreferencesSchema.optional()
	}),
	handler: () => ({
		preferences: undefined
	})
});
