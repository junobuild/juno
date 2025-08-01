import type { CustomDomain } from '$declarations/satellite/satellite.did';
import { CanisterIdTextSchema } from '$lib/schemas/canister.schema';
import { ExchangePriceSchema } from '$lib/schemas/exchange.schema';
import type {
	CanisterSegment,
	CanisterSyncData,
	CanisterSyncMonitoring
} from '$lib/types/canister';
import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
import type { CertifiedData } from '$lib/types/store';
import type { VersionRegistry } from '$lib/types/version';
import * as z from 'zod/v4';

export const PostMessageDataRequestDataSchema = z.object({
	segments: z.array(z.custom<CanisterSegment>()).optional(),
	customDomain: z.custom<CustomDomain>().optional(),
	missionControlId: z.string().optional(),
	withMonitoringHistory: z.boolean().optional()
});

const JsonCertifiedIcTransactionUiTextSchema = z.string();

const PostMessageWalletDataSchema = z.object({
	balance: z.custom<CertifiedData<bigint>>(),
	newTransactions: JsonCertifiedIcTransactionUiTextSchema
});

export const PostMessageDataResponseWalletSchema = z.object({
	wallet: PostMessageWalletDataSchema
});

export const PostMessageDataResponseWalletCleanUpSchema = z.object({
	transactionIds: z.array(z.string())
});

export const PostMessageDataResponseErrorSchema = z.object({
	error: z.unknown()
});

export const PostMessageDataResponseAuthSchema = z.object({
	authRemainingTime: z.number()
});

export const PostMessageDataResponseCanisterSyncDataSchema = z.object({
	canister: z.custom<CanisterSyncData>().optional()
});

export const PostMessageDataResponseCanisterMonitoringSchema = z.object({
	canister: z.custom<CanisterSyncMonitoring>().optional()
});

export const PostMessageDataResponseCanistersSyncDataSchema = z.object({
	canisters: z.array(z.custom<CanisterSyncData>()).optional()
});

export const PostMessageDataResponseCanistersMonitoringSchema = z.object({
	canisters: z.array(z.custom<CanisterSyncMonitoring>()).optional()
});

export const PostMessageDataResponseHostingSchema = z.object({
	registrationState: z.custom<CustomDomainRegistrationState>().nullable().optional()
});

export const PostMessageDataResponseRegistrySchema = z.object({
	registry: z.custom<VersionRegistry>()
});

const PostMessageDataResponseExchangeDataSchema = z.record(
	CanisterIdTextSchema,
	ExchangePriceSchema.nullable()
);

export const PostMessageDataResponseExchangeSchema = z.object({
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
	'restartWalletTimer',
	'startMonitoringTimer',
	'stopMonitoringTimer',
	'restartMonitoringTimer',
	'loadRegistry'
]);

export const PostMessageResponseMsgSchema = z.enum([
	'syncCanister',
	'syncCanisters',
	'signOutIdleTimer',
	'delegationRemainingTime',
	'customDomainRegistrationState',
	'syncWallet',
	'syncWalletCleanUp',
	'syncWalletError',
	'syncExchange',
	'syncRegistry',
	'syncRegistryError'
]);

export const PostMessageRequestSchema = z.object({
	msg: PostMessageRequestMsgSchema,
	data: PostMessageDataRequestDataSchema
});

export const inferPostMessageSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		msg: z.union([PostMessageRequestMsgSchema, PostMessageResponseMsgSchema]),
		data: dataSchema.optional()
	});
