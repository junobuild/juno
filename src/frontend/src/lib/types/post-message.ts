import type { CustomDomain } from '$declarations/satellite/satellite.did';
import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
import type { ExchangePrice } from '$lib/types/exchange';
import type { Wallet } from '$lib/types/transaction';
import type {
	CanisterIdText,
	CanisterSegment,
	CanisterSyncData,
	CanisterSyncMonitoring
} from './canister';

export interface PostMessageDataRequest {
	segments?: CanisterSegment[];
	customDomain?: CustomDomain;
	missionControlId?: string;
	withMonitoringHistory?: boolean;
}

export interface PostMessageDataResponse {
	canister?: CanisterSyncData | CanisterSyncMonitoring;
	registrationState?: CustomDomainRegistrationState | null;
	wallet?: Wallet;
	exchanges?: Record<CanisterIdText, ExchangePrice>;
}

export type PostMessageRequest =
	| 'startCyclesTimer'
	| 'stopCyclesTimer'
	| 'restartCyclesTimer'
	| 'startIdleTimer'
	| 'stopIdleTimer'
	| 'startCustomDomainRegistrationTimer'
	| 'stopCustomDomainRegistrationTimer'
	| 'stopWalletTimer'
	| 'startWalletTimer'
	| 'startMonitoringTimer'
	| 'stopMonitoringTimer'
	| 'restartMonitoringTimer';

export type PostMessageResponse =
	| 'syncCanister'
	| 'signOutIdleTimer'
	| 'delegationRemainingTime'
	| 'customDomainRegistrationState'
	| 'syncWallet'
	| 'syncExchange';

export interface PostMessageDataResponseAuth extends PostMessageDataResponse {
	authRemainingTime: number;
}

export interface PostMessage<T extends PostMessageDataRequest | PostMessageDataResponse> {
	msg: PostMessageRequest | PostMessageResponse;
	data: T;
}
