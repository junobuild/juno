import type { CustomDomain } from '$declarations/satellite/satellite.did';
import type { Canister } from './canister';
import type {CustomDomainRegistrationState} from "$lib/types/custom-domain";

export interface PostMessageDataRequest {
	canisterIds?: string[];
	customDomain?: CustomDomain;
}

export interface PostMessageDataResponse {
	canister?: Canister;
	registrationState?: CustomDomainRegistrationState | null
}

export type PostMessageRequest =
	| 'startCyclesTimer'
	| 'stopCyclesTimer'
	| 'restartCyclesTimer'
	| 'startIdleTimer'
	| 'stopIdleTimer'
	| 'startCustomDomainRegistrationTimer'
	| 'stopCustomDomainRegistrationTimer';

export type PostMessageResponse =
	| 'syncCanister'
	| 'signOutIdleTimer'
	| 'customDomainRegistrationState';

export interface PostMessage<T extends PostMessageDataRequest | PostMessageDataResponse> {
	msg: PostMessageRequest | PostMessageResponse;
	data: T;
}
