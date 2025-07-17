import {
	type inferPostMessageSchema,
	type PostMessageDataRequestDataSchema,
	type PostMessageDataResponseAuthSchema,
	type PostMessageDataResponseCanisterMonitoringSchema,
	type PostMessageDataResponseCanistersMonitoringSchema,
	type PostMessageDataResponseCanistersSyncDataSchema,
	type PostMessageDataResponseCanisterSyncDataSchema,
	type PostMessageDataResponseErrorSchema,
	type PostMessageDataResponseExchangeSchema,
	type PostMessageDataResponseHostingSchema, PostMessageDataResponseRegistrySchema,
	type PostMessageDataResponseWalletCleanUpSchema,
	type PostMessageDataResponseWalletSchema,
	type PostMessageRequestSchema
} from '$lib/schemas/post-message.schema';
import type * as z from 'zod/v4';

// Request

export type PostMessageDataRequest = z.infer<typeof PostMessageDataRequestDataSchema>;

export type PostMessageRequest = z.infer<typeof PostMessageRequestSchema>;

// Response

export type PostMessageDataResponseAuth = z.infer<typeof PostMessageDataResponseAuthSchema>;

export type PostMessageDataResponseCanisterSyncData = z.infer<
	typeof PostMessageDataResponseCanisterSyncDataSchema
>;

export type PostMessageDataResponseCanisterMonitoring = z.infer<
	typeof PostMessageDataResponseCanisterMonitoringSchema
>;

export type PostMessageDataResponseCanistersSyncData = z.infer<
	typeof PostMessageDataResponseCanistersSyncDataSchema
>;

export type PostMessageDataResponseCanistersMonitoring = z.infer<
	typeof PostMessageDataResponseCanistersMonitoringSchema
>;

export type PostMessageDataResponseHosting = z.infer<typeof PostMessageDataResponseHostingSchema>;

export type PostMessageDataResponseRegistry = z.infer<typeof PostMessageDataResponseRegistrySchema>;

export type PostMessageDataResponseExchange = z.infer<typeof PostMessageDataResponseExchangeSchema>;

export type PostMessageDataResponseWallet = z.infer<typeof PostMessageDataResponseWalletSchema>;

export type PostMessageDataResponseWalletCleanUp = z.infer<
	typeof PostMessageDataResponseWalletCleanUpSchema
>;

export type PostMessageDataResponseError = z.infer<typeof PostMessageDataResponseErrorSchema>;

type PostMessageWallet = z.infer<
	ReturnType<typeof inferPostMessageSchema<typeof PostMessageDataResponseWalletSchema>>
>;
type PostMessageWalletCleanUp = z.infer<
	ReturnType<typeof inferPostMessageSchema<typeof PostMessageDataResponseWalletCleanUpSchema>>
>;
type PostMessageError = z.infer<
	ReturnType<typeof inferPostMessageSchema<typeof PostMessageDataResponseErrorSchema>>
>;
type PostMessageExchange = z.infer<
	ReturnType<typeof inferPostMessageSchema<typeof PostMessageDataResponseExchangeSchema>>
>;

export type PostMessages =
	| PostMessageWallet
	| PostMessageWalletCleanUp
	| PostMessageError
	| PostMessageExchange;
