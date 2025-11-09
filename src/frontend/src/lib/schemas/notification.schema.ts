import * as z from 'zod';

export const NotificationPreferencesSchema = z.strictObject({
	freezingThreshold: z.boolean().optional()
});
