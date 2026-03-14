import { defineUpdate } from '@junobuild/functions';
import { msgCaller } from '@junobuild/functions/ic-cdk';
import { encodeDocData, setDocStore } from '@junobuild/functions/sdk';
import { j } from '@junobuild/schema';

const StatusSchema = j.discriminatedUnion('type', [
	j.object({ type: j.literal('active'), owner: j.principal() }),
	j.object({ type: j.literal('inactive') }),
	j.object({ type: j.literal('pending'), assignee: j.principal() })
]);

// The proc macros should support for enums associated with struct data (variantRecords)
// i.e. json_data should be supported not only in struct but in enum too
export const checkEnums = defineUpdate({
	args: j.object({
		username: j.string(),
		status: StatusSchema
	}),
	result: j.object({ status: j.literal('ok', 'error') }),
	handler: (data) => {
		const caller = msgCaller();

		setDocStore({
			caller,
			collection: 'test-notes',
			key: msgCaller().toText(),
			doc: {
				data: encodeDocData(data)
			}
		});

		return { status: 'ok' as const };
	}
});

const SimpleVariantSchema = j.enum(['active', 'inactive', 'pending']);

export const checkSimpleVariant = defineUpdate({
	args: j.object({ value: SimpleVariantSchema }),
	result: j.object({ value: SimpleVariantSchema }),
	handler: (data) => data
});

export const checkDiscriminatedUnionEcho = defineUpdate({
	args: j.object({ status: StatusSchema }),
	result: j.object({ status: StatusSchema }),
	handler: (data) => data
});

const DiscriminatedPrimitivesSchema = j.discriminatedUnion('kind', [
	j.object({ kind: j.literal('text'), value: j.string() }),
	j.object({ kind: j.literal('number'), value: j.number() }),
	j.object({ kind: j.literal('flag'), value: j.boolean() })
]);

export const checkDiscriminatedPrimitives = defineUpdate({
	args: j.object({ data: DiscriminatedPrimitivesSchema }),
	result: j.object({ data: DiscriminatedPrimitivesSchema }),
	handler: (data) => data
});

const NestedDiscriminatedSchema = j.object({
	id: j.string(),
	status: StatusSchema
});

export const checkNestedDiscriminated = defineUpdate({
	args: NestedDiscriminatedSchema,
	result: NestedDiscriminatedSchema,
	handler: (data) => data
});
