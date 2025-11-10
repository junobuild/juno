import { isNullish, notEmptyString } from '@dfinity/utils';

// We broadcast an object that contains the message and an emitter
// because we want to ignore the message in the tab that emitted its.
// This is useful for example to avoid to reload the auth store if already
// synced (since the postMessage happens after login).
interface BroadcastData {
	msg: string;
	emitterId: string;
}

// If the user has more than one tab open in the same browser,
// there could be a mismatch of the cached delegation chain vs the identity key of the `authClient` object.
// This causes the `authClient` to be unable to correctly sign calls, raising Trust Errors.
// To mitigate this, we use a `BroadcastChannel` to notify other tabs when a login has occurred, so that they can sync their `authClient` object.
export class AuthBroadcastChannel {
	static #instance: AuthBroadcastChannel;

	readonly #bc: BroadcastChannel;
	readonly #emitterId: string;

	static readonly CHANNEL_NAME: BroadcastChannel['name'] = 'juno_console_auth_channel';
	static readonly MESSAGE_LOGIN_SUCCESS = 'authClientLoginSuccess';

	private constructor() {
		this.#bc = new BroadcastChannel(AuthBroadcastChannel.CHANNEL_NAME);
		this.#emitterId = window.crypto.randomUUID();
	}

	static getInstance(): AuthBroadcastChannel {
		if (isNullish(this.#instance)) {
			this.#instance = new AuthBroadcastChannel();
		}

		return this.#instance;
	}

	onLoginSuccess = (handler: () => Promise<void>) => {
		const {
			location: { origin }
		} = window;

		this.#bc.onmessage = async ($event) => {
			if (
				$event.origin === origin &&
				$event.data?.msg === AuthBroadcastChannel.MESSAGE_LOGIN_SUCCESS &&
				notEmptyString($event.data?.emitterId) &&
				$event.data?.emitterId !== this.#emitterId
			) {
				await handler();
			}
		};
	};

	close = () => {
		this.#bc.close();
	};

	postLoginSuccess = () => {
		const data: BroadcastData = {
			emitterId: this.#emitterId,
			msg: AuthBroadcastChannel.MESSAGE_LOGIN_SUCCESS
		};

		this.#bc.postMessage(data);
	};

	get __test__only__emitted_id__(): string {
		return this.#emitterId;
	}
}
