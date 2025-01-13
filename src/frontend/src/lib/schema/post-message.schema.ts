import type { CustomDomain } from '$declarations/satellite/satellite.did';
import { CanisterIdTextSchema } from '$lib/schema/canister.schema';
import { ExchangePriceSchema } from '$lib/schema/exchange.schema';
import type {
	CanisterSegment,
	CanisterSyncData,
	CanisterSyncMonitoring
} from '$lib/types/canister';
import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
import type { Wallet } from '$lib/types/transaction';
import * as z from 'zod';

export const PostMessageDataRequestDataSchema = z.object({
	segments: z.array(z.custom<CanisterSegment>()).optional(),
	customDomain: z.custom<CustomDomain>().optional(),
	missionControlId: z.string().optional(),
	withMonitoringHistory: z.boolean().optional()
});

export const PostMessageDataResponseExchangeDataSchema = z.record(
	CanisterIdTextSchema,
	ExchangePriceSchema.nullable()
);

export const PostMessageDataResponseDataSchema = z.object({
	canister: z.union([z.custom<CanisterSyncData>(), z.custom<CanisterSyncMonitoring>()]).optional(),
	registrationState: z.custom<CustomDomainRegistrationState>().nullable().optional(),
	wallet: z.custom<Wallet>().optional(),
	authRemainingTime: z.number().optional(),
	exchange: PostMessageDataResponseExchangeDataSchema.optional()
});

export const PostMessageRequestMsgSchema = z.enum([
	'startCyclesTimer',
	'stopCyclesTimer',
	'restartCyclesTimer',
	'startIdleTimer',
	'stopIdleTimer',
	'startCustomDomainRegistrationTimer',
	'stopCustomDomainRegistrationTimer',
	'stopWalletTimer',
	'startWalletTimer',
	'startMonitoringTimer',
	'stopMonitoringTimer',
	'restartMonitoringTimer'
]);

export const PostMessageResponseMsgSchema = z.enum([
	'syncCanister',
	'signOutIdleTimer',
	'delegationRemainingTime',
	'customDomainRegistrationState',
	'syncWallet',
	'syncExchange'
]);

export const PostMessageRequestSchema = z.object({
	msg: PostMessageRequestMsgSchema,
	data: PostMessageDataRequestDataSchema
});

export const PostMessageResponseSchema = z.object({
	msg: PostMessageResponseMsgSchema,
	data: PostMessageDataResponseDataSchema
});
