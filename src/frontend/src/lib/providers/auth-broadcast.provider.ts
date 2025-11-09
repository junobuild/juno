// If the user has more than one tab open in the same browser,
// there could be a mismatch of the cached delegation chain vs the identity key of the `authClient` object.
// This causes the `authClient` to be unable to correctly sign calls, raising Trust Errors.
// To mitigate this, we use a `BroadcastChannel` to notify other tabs when a login has occurred, so that they can sync their `authClient` object.
export class AuthBroadcastChannel {
	readonly #bc: BroadcastChannel;

	static readonly CHANNEL_NAME: BroadcastChannel['name'] = 'juno_console_auth_channel';
	static readonly MESSAGE_LOGIN_SUCCESS = 'authClientLoginSuccess';

	constructor() {
		this.#bc = new BroadcastChannel(AuthBroadcastChannel.CHANNEL_NAME);
	}

	onLoginSuccess = (handler: () => Promise<void>) => {
		const {
			location: { origin }
		} = window;

		this.#bc.onmessage = async ($event) => {
			if ($event.origin === origin && $event.data === AuthBroadcastChannel.MESSAGE_LOGIN_SUCCESS) {
				await handler();
			}
		};
	};

	close = () => {
		this.#bc.close();
	};

	postLoginSuccess = () => {
		this.#bc.postMessage(AuthBroadcastChannel.MESSAGE_LOGIN_SUCCESS);
	};
}
