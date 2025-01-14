import {
	type PostMessageDataRequestDataSchema,
	PostMessageDataResponseDataSchema,
	PostMessageDataResponseExchangeDataSchema,
	PostMessageRequestSchema,
	PostMessageResponseSchema
} from '$lib/schema/post-message.schema';
import * as z from 'zod';

export type PostMessageDataRequest = z.infer<typeof PostMessageDataRequestDataSchema>;

export type PostMessageDataResponse = z.infer<typeof PostMessageDataResponseDataSchema>;

export type PostMessageDataResponseExchangeData = z.infer<
	typeof PostMessageDataResponseExchangeDataSchema
>;

export type PostMessageRequest = z.infer<typeof PostMessageRequestSchema>;

export type PostMessageResponse = z.infer<typeof PostMessageResponseSchema>;
