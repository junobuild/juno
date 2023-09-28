import type { CustomDomain } from '$declarations/satellite/satellite.did';
import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
import type { Wallet } from '$lib/types/transaction';
import type { Canister } from './canister';

export interface PostMessageDataRequest {
	canisterIds?: string[];
	customDomain?: CustomDomain;
	missionControlId?: string;
}

export interface PostMessageDataResponse {
	canister?: Canister;
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
	| 'reloadWallet';

export type PostMessageResponse =
	| 'syncCanister'
	| 'signOutIdleTimer'
	| 'customDomainRegistrationState'
	| 'syncWallet';

export interface PostMessage<T extends PostMessageDataRequest | PostMessageDataResponse> {
	msg: PostMessageRequest | PostMessageResponse;
	data: T;
}
