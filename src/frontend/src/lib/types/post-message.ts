import {
	type PostMessageDataRequestDataSchema,
	PostMessageDataResponseDataAuthSchema,
	PostMessageDataResponseDataSchema,
	PostMessageRequestSchema,
	PostMessageResponseSchema
} from '$lib/schema/post-message.schema';
import * as z from 'zod';

export type PostMessageDataRequest = z.infer<typeof PostMessageDataRequestDataSchema>;

export type PostMessageDataResponse = z.infer<typeof PostMessageDataResponseDataSchema>;

export type PostMessageDataResponseAuth = z.infer<typeof PostMessageDataResponseDataAuthSchema>;

export type PostMessageRequest = z.infer<typeof PostMessageRequestSchema>;

export type PostMessageResponse = z.infer<typeof PostMessageResponseSchema>;
