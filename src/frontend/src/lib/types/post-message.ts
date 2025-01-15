import {
	type PostMessageDataRequestDataSchema,
	PostMessageDataResponseDataSchema,
	PostMessageDataResponseErrorDataSchema,
	PostMessageDataResponseExchangeDataSchema,
	PostMessageDataResponseWalletCleanUpDataSchema,
	PostMessageDataResponseWalletDataSchema,
	PostMessageRequestSchema,
	PostMessageResponseSchema
} from '$lib/schema/post-message.schema';
import * as z from 'zod';

export type PostMessageDataRequest = z.infer<typeof PostMessageDataRequestDataSchema>;

export type PostMessageDataResponse = z.infer<typeof PostMessageDataResponseDataSchema>;

export type PostMessageDataResponseExchangeData = z.infer<
	typeof PostMessageDataResponseExchangeDataSchema
>;

export type PostMessageDataResponseWalletData = z.infer<
	typeof PostMessageDataResponseWalletDataSchema
>;

export type PostMessageDataResponseWalletCleanUpData = z.infer<
	typeof PostMessageDataResponseWalletCleanUpDataSchema
>;

export type PostMessageDataResponseErrorData = z.infer<
	typeof PostMessageDataResponseErrorDataSchema
>;

export type PostMessageRequest = z.infer<typeof PostMessageRequestSchema>;

export type PostMessageResponse = z.infer<typeof PostMessageResponseSchema>;
