import * as z from 'zod/v4';

export const NotificationPreferencesSchema = z.strictObject({
	freezingThreshold: z.boolean().optional()
});
