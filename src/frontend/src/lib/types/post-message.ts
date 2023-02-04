import type { Canister } from './canister';

export interface PostMessageDataRequest {
	canisterIds: string[];
}

export interface PostMessageDataResponse {
	canister?: Canister;
}

export type PostMessageRequest =
	| 'startCyclesTimer'
	| 'stopCyclesTimer'
	| 'startIdleTimer'
	| 'stopIdleTimer';

export type PostMessageResponse = 'syncCanister' | 'signOutIdleTimer';

export interface PostMessage<T extends PostMessageDataRequest | PostMessageDataResponse> {
	msg: PostMessageRequest | PostMessageResponse;
	data: T;
}
