import type { CustomDomain } from '$declarations/satellite/satellite.did';
import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
import type { Wallet } from '$lib/types/transaction';
import type { CanisterIcStatus, CanisterJunoStatus, CanisterSegment } from './canister';

export interface PostMessageDataRequest {
	segments?: CanisterSegment[];
	customDomain?: CustomDomain;
	missionControlId?: string;
}

export interface PostMessageDataResponse {
	canister?: CanisterIcStatus | CanisterJunoStatus;
	registrationState?: CustomDomainRegistrationState | null;
	wallet?: Wallet;
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
	| 'startStatusesTimer'
	| 'stopStatusesTimer'
	| 'restartStatusesTimer';

export type PostMessageResponse =
	| 'syncCanister'
	| 'signOutIdleTimer'
	| 'delegationRemainingTime'
	| 'customDomainRegistrationState'
	| 'syncWallet';

export interface PostMessageDataResponseAuth extends PostMessageDataResponse {
	authRemainingTime: number;
}

export interface PostMessage<T extends PostMessageDataRequest | PostMessageDataResponse> {
	msg: PostMessageRequest | PostMessageResponse;
	data: T;
}
