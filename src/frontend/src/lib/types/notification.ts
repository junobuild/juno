import { NotificationPreferencesSchema } from '$lib/schemas/notification.schema';
import type * as z from 'zod/v4';

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
