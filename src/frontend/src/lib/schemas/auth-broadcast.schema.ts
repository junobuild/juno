import * as z from 'zod';

// We broadcast an object that contains the message and an emitter
// because we want to ignore the message in the tab that emitted its.
// This is useful for example to avoid to reload the auth store if already
// synced (since the postMessage happens after login).
export const BroadcastDataSchema = z.strictObject({
	msg: z.literal('authClientLoginSuccess'),
	emitterId: z.string().nonempty()
});
