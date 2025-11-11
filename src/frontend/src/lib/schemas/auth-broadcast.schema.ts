import * as z from 'zod';

// We broadcast an object containing both the message and the emitter.
// This allows us to ignore the message in the tab that originally sent it.
// For example, it prevents reloading the auth store if it's already synced,
// since the postMessage is triggered after login.
export const BroadcastDataSchema = z.strictObject({
	msg: z.literal('authClientLoginSuccess'),
	emitterId: z.string().nonempty()
});
