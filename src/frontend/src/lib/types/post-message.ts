import {
	inferPostMessageSchema,
	type PostMessageDataRequestDataSchema,
	PostMessageDataResponseAuthSchema,
	PostMessageDataResponseCanisterMonitoringSchema,
	PostMessageDataResponseCanisterSchema,
	PostMessageDataResponseCanisterSyncDataSchema,
	PostMessageDataResponseErrorSchema,
	PostMessageDataResponseExchangeSchema,
	PostMessageDataResponseHostingSchema,
	PostMessageDataResponseSchema,
	PostMessageDataResponseWalletCleanUpSchema,
	PostMessageDataResponseWalletSchema,
	PostMessageRequestSchema
} from '$lib/schema/post-message.schema';
import * as z from 'zod';
import { ZodType } from 'zod';

// Request

export type PostMessageDataRequest = z.infer<typeof PostMessageDataRequestDataSchema>;

export type PostMessageRequest = z.infer<typeof PostMessageRequestSchema>;

// Response

export type PostMessageDataResponse = z.infer<typeof PostMessageDataResponseSchema>;

export type PostMessageDataResponseAuth = z.infer<typeof PostMessageDataResponseAuthSchema>;

export type PostMessageDataResponseCanisterSyncData = z.infer<
	typeof PostMessageDataResponseCanisterSyncDataSchema
>;

export type PostMessageDataResponseCanisterMonitoring = z.infer<
	typeof PostMessageDataResponseCanisterMonitoringSchema
>;

export type PostMessageDataResponseCanister = z.infer<typeof PostMessageDataResponseCanisterSchema>;

export type PostMessageDataResponseHosting = z.infer<typeof PostMessageDataResponseHostingSchema>;

export type PostMessageDataResponseExchange = z.infer<typeof PostMessageDataResponseExchangeSchema>;

export type PostMessageDataResponseWallet = z.infer<typeof PostMessageDataResponseWalletSchema>;

export type PostMessageDataResponseWalletCleanUp = z.infer<
	typeof PostMessageDataResponseWalletCleanUpSchema
>;

export type PostMessageDataResponseError = z.infer<typeof PostMessageDataResponseErrorSchema>;

export type PostMessage<T extends PostMessageDataRequest | PostMessageDataResponse> = z.infer<
	ReturnType<typeof inferPostMessageSchema<ZodType<T>>>
>;
