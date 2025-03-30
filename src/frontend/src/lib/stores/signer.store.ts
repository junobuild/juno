import { DEV, LOCAL_REPLICA_URL } from '$lib/constants/app.constants';
import type { Option } from '$lib/types/utils';
import type { Identity } from '@dfinity/agent';
import {
	ICRC21_CALL_CONSENT_MESSAGE,
	ICRC25_REQUEST_PERMISSIONS,
	ICRC27_ACCOUNTS,
	ICRC49_CALL_CANISTER,
	type AccountsPromptPayload,
	type CallCanisterPromptPayload,
	type ConsentMessagePromptPayload,
	type PermissionsPromptPayload
} from '@dfinity/oisy-wallet-signer';
import { Signer } from '@dfinity/oisy-wallet-signer/signer';
import { isNullish } from '@dfinity/utils';
import { derived, writable, type Readable } from 'svelte/store';

/**
 * Interface for managing the OISY Wallet Signer context in any route or component.
 */
export interface SignerContext {
	/**
	 * Initializes the signer with the authenticated user - the owner of the wallet.
	 * @param {Object} params - Initialization parameters.
	 * @param {Identity} params.owner - The identity of the signer owner.
	 */
	init: (params: { owner: Identity }) => void;

	/**
	 * Resets the signer context and disconnects the signer.
	 */
	reset: () => void;

	/**
	 * A derived store that indicates if all prompts of the signer that either require user interactions or are calls to the IC are idle.
	 * @type {Readable<boolean>}
	 */
	idle: Readable<boolean>;

	/**
	 * Handles the accounts prompt requests.
	 */
	accountsPrompt: {
		/**
		 * A derived store containing the accounts prompt payload.
		 * @type {Readable<PermissionsPromptPayload | undefined | null>}
		 */
		payload: Readable<AccountsPromptPayload | undefined | null>;

		/**
		 * Resets the accounts prompt payload to null once processed.
		 */
		reset: () => void;
	};

	/**
	 * Handles the permissions prompt requests.
	 */
	permissionsPrompt: {
		/**
		 * A derived store containing the permissions prompt payload.
		 * @type {Readable<PermissionsPromptPayload | undefined | null>}
		 */
		payload: Readable<PermissionsPromptPayload | undefined | null>;

		/**
		 * Resets the permissions prompt payload to null once processed.
		 */
		reset: () => void;
	};

	/**
	 * Handles the consent message prompt requests.
	 */
	consentMessagePrompt: {
		/**
		 * A derived store containing the consent message prompt payload.
		 * @type {Readable<ConsentMessagePromptPayload | undefined | null>}
		 */
		payload: Readable<ConsentMessagePromptPayload | undefined | null>;

		/**
		 * Resets the consent message prompt payload to null once processed.
		 */
		reset: () => void;
	};

	/**
	 * Handles the call canister prompt state.
	 */
	callCanisterPrompt: {
		/**
		 * A derived store containing the call canister prompt payload.
		 * @type {Readable<CallCanisterPromptPayload | undefined | null>}
		 */
		payload: Readable<CallCanisterPromptPayload | undefined | null>;

		/**
		 * Resets the call canister prompt payload to null once processed.
		 */
		reset: () => void;
	};
}

/**
 * Initializes the SignerContext, creating the signer and registering various stores to handles its prompts.
 *
 * @returns {SignerContext} The initialized signer context, providing functions and stores to interact with the signer.
 */
export const initSignerContext = (): SignerContext => {
	let signer: Option<Signer>;

	const accountsPromptPayloadStore = writable<AccountsPromptPayload | undefined | null>(undefined);

	const permissionsPromptPayloadStore = writable<PermissionsPromptPayload | undefined | null>(
		undefined
	);

	const consentMessagePromptPayloadStore = writable<ConsentMessagePromptPayload | undefined | null>(
		undefined
	);

	const callCanisterPromptPayloadStore = writable<CallCanisterPromptPayload | undefined | null>(
		undefined
	);

	const accountsPromptPayload = derived(
		[accountsPromptPayloadStore],
		([$accountsPromptPayloadStore]) => $accountsPromptPayloadStore
	);

	const permissionsPromptPayload = derived(
		[permissionsPromptPayloadStore],
		([$permissionsPromptPayloadStore]) => $permissionsPromptPayloadStore
	);

	const consentMessagePromptPayload = derived(
		[consentMessagePromptPayloadStore],
		([$consentMessagePromptPayloadStore]) => $consentMessagePromptPayloadStore
	);

	const callCanisterPromptPayload = derived(
		[callCanisterPromptPayloadStore],
		([$callCanisterPromptPayloadStore]) => $callCanisterPromptPayloadStore
	);

	// We omit the accountsPrompt for the idle status because this prompt is handled without user interactions.
	const idle = derived(
		[permissionsPromptPayload, consentMessagePromptPayload, callCanisterPromptPayload],
		([$permissionsPromptPayload, $consentMessagePromptPayload, $callCanisterPromptPayloadStore]) =>
			isNullish($permissionsPromptPayload) &&
			isNullish($consentMessagePromptPayload) &&
			isNullish($callCanisterPromptPayloadStore)
	);

	const init = ({ owner }: { owner: Identity }) => {
		signer = Signer.init({
			owner,
			...(DEV && { host: LOCAL_REPLICA_URL })
		});

		signer.register({
			method: ICRC25_REQUEST_PERMISSIONS,
			prompt: (payload: PermissionsPromptPayload) => permissionsPromptPayloadStore.set(payload)
		});

		signer.register({
			method: ICRC27_ACCOUNTS,
			prompt: (payload: AccountsPromptPayload) => accountsPromptPayloadStore.set(payload)
		});

		signer.register({
			method: ICRC21_CALL_CONSENT_MESSAGE,
			prompt: (payload: ConsentMessagePromptPayload) => {
				consentMessagePromptPayloadStore.set(payload);
			}
		});

		signer.register({
			method: ICRC49_CALL_CANISTER,
			prompt: (payload: CallCanisterPromptPayload) => {
				callCanisterPromptPayloadStore.set(payload);
			}
		});
	};

	const resetAccountsPromptPayload = () => accountsPromptPayloadStore.set(null);
	const resetPermissionsPromptPayload = () => permissionsPromptPayloadStore.set(null);
	const resetConsentMessagePromptPayload = () => consentMessagePromptPayloadStore.set(null);
	const resetCallCanisterPromptPayload = () => callCanisterPromptPayloadStore.set(null);

	const reset = () => {
		resetAccountsPromptPayload();
		resetPermissionsPromptPayload();
		resetConsentMessagePromptPayload();
		resetCallCanisterPromptPayload();

		signer?.disconnect();
		signer = null;
	};

	return {
		init,
		reset,
		idle,
		accountsPrompt: {
			payload: accountsPromptPayload,
			reset: resetAccountsPromptPayload
		},
		permissionsPrompt: {
			payload: permissionsPromptPayload,
			reset: resetPermissionsPromptPayload
		},
		consentMessagePrompt: {
			payload: consentMessagePromptPayload,
			reset: resetConsentMessagePromptPayload
		},
		callCanisterPrompt: {
			payload: callCanisterPromptPayload,
			reset: resetCallCanisterPromptPayload
		}
	};
};

export const SIGNER_CONTEXT_KEY = Symbol('signer');
