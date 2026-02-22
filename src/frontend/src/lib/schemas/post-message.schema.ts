import { CanisterIdTextSchema } from '$lib/schemas/canister.schema';
import { CustomDomainStateSchema } from '$lib/schemas/custom-domain.schema';
import { ExchangePriceSchema } from '$lib/schemas/exchange.schema';
import {
	IcrcAccountTextSchema,
	LedgerIdTextSchema,
	WalletIdTextSchema
} from '$lib/schemas/wallet.schema';
import type {
	CanisterSegment,
	CertifiedCanisterSyncData,
	UncertifiedCanisterSyncMonitoring
} from '$lib/types/canister';
import type { CustomDomain } from '$lib/types/custom-domain';
import type { CertifiedData } from '$lib/types/store';
import type { VersionRegistry } from '$lib/types/version';
import { PrincipalTextSchema } from '@dfinity/zod-schemas';
import * as z from 'zod';

export const PostMessageDataRequestDataSchema = z.object({
	segments: z.array(z.custom<CanisterSegment>()).optional(),
	customDomain: z.custom<CustomDomain>().optional(),
	missionControlId: z.string().optional(),
	walletIds: z.array(WalletIdTextSchema).optional(),
	withMonitoringHistory: z.boolean().optional(),
	satelliteId: PrincipalTextSchema.optional()
});

const JsonCertifiedIcTransactionUiTextSchema = z.string();

const PostMessageWalletDataSchema = z.object({
	walletId: WalletIdTextSchema,
	ledgerId: LedgerIdTextSchema,
	balance: z.custom<CertifiedData<bigint>>(),
	newTransactions: JsonCertifiedIcTransactionUiTextSchema
});

export const PostMessageDataResponseWalletSchema = z.object({
	wallet: PostMessageWalletDataSchema
});

const JsonCertifiedWorkflowsTextSchema = z.string();

const PostMessageWorkflowsDataSchema = z.object({
	satelliteId: PrincipalTextSchema,
	newWorkflows: JsonCertifiedWorkflowsTextSchema
});

export const PostMessageDataResponseWorkflowsSchema = z.object({
	workflows: PostMessageWorkflowsDataSchema
});

export const PostMessageDataResponseWalletCleanUpSchema = z.object({
	walletId: IcrcAccountTextSchema,
	ledgerId: LedgerIdTextSchema,
	transactionIds: z.array(z.string())
});

export const PostMessageDataResponseErrorSchema = z.object({
	error: z.unknown()
});

export const PostMessageDataResponseAuthSchema = z.object({
	authRemainingTime: z.number()
});

export const PostMessageDataResponseCanisterSyncDataSchema = z.object({
	canister: z.custom<CertifiedCanisterSyncData>().optional()
});

export const PostMessageDataResponseCanisterMonitoringSchema = z.object({
	canister: z.custom<UncertifiedCanisterSyncMonitoring>().optional()
});

export const PostMessageDataResponseCanistersSyncDataSchema = z.object({
	canisters: z.array(z.custom<CertifiedCanisterSyncData>()).optional()
});

export const PostMessageDataResponseCanistersMonitoringSchema = z.object({
	canisters: z.array(z.custom<UncertifiedCanisterSyncMonitoring>()).optional()
});

export const PostMessageDataResponseHostingSchema = z.object({
	registrationState: CustomDomainStateSchema.nullable().optional()
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

export const PostMessageDataResponseIcpToCyclesRateSchema = z.object({
	rate: z.custom<CertifiedData<bigint>>()
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
	'loadRegistry',
	'stopWorkflowsTimer',
	'startWorkflowsTimer',
	'restartWorkflowsTimer'
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
	'syncRegistryError',
	'syncIcpToCyclesRate',
	'syncWorkflows',
	'syncWorkflowsError'
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
