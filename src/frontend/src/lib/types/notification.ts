import type { NotificationPreferencesSchema } from '$lib/schemas/notification.schema';
import type * as z from 'zod';

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
