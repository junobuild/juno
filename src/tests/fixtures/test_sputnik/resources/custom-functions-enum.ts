import { defineUpdate, PrincipalSchema } from '@junobuild/functions';
import { msgCaller } from '@junobuild/functions/ic-cdk';
import { encodeDocData, setDocStore } from '@junobuild/functions/sdk';
import * as z from 'zod';

const StatusSchema = z.discriminatedUnion('type', [
	z.object({ type: z.literal('active'), owner: PrincipalSchema }),
	z.object({ type: z.literal('inactive') }),
	z.object({ type: z.literal('pending'), assignee: PrincipalSchema })
]);

// The proc macros should support for enums associated with struct data (variantRecords)
// i.e. json_data should be supported not only in struct but in enum too
export const checkEnums = defineUpdate({
	args: z.object({
		username: z.string(),
		status: StatusSchema
	}),
	result: z.object({ status: z.literal('ok', 'error') }),
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
