import { AuthBroadcastChannel } from '$lib/services/auth/auth-broadcast.services';

describe('auth-broadcast.services', () => {
	let originalWindowLocation: Location;
	const mockUrl = 'https://console.juno.build';

	beforeEach(() => {
		originalWindowLocation = window.location;
		vi.stubGlobal('location', { origin: mockUrl });
	});

	afterEach(() => {
		vi.stubGlobal('location', originalWindowLocation);
	});

	describe('AuthBroadcastChannel', () => {
		let bc: AuthBroadcastChannel;

		const channelName = AuthBroadcastChannel.CHANNEL_NAME;
		const loginSuccessMessage = AuthBroadcastChannel.MESSAGE_LOGIN_SUCCESS;

		const postMessageSpy = vi.fn();
		const closeSpy = vi.fn();

		const mockOrigin = vi.fn().mockReturnValue(mockUrl);

		const mockChannels = new Map<string, BroadcastChannel>();

		const mockHandler = vi.fn();

		beforeEach(() => {
			vi.clearAllMocks();

			vi.stubGlobal(
				'BroadcastChannel',
				vi.fn((name: string) => {
					const channel =
						mockChannels.get(name) ??
						({
							name,
							onmessage: null,
							postMessage: postMessageSpy,
							close: closeSpy
						} as unknown as BroadcastChannel);

					postMessageSpy.mockImplementation((message: unknown) => {
						const event = new MessageEvent('message', {
							data: message,
							origin: mockOrigin()
						});

						channel.onmessage?.(event);
					});

					mockChannels.set(name, channel);

					return channel;
				})
			);

			bc = new AuthBroadcastChannel();

			bc.onLoginSuccess(mockHandler);
		});

		afterEach(() => {
			bc.close();

			vi.unstubAllGlobals();
		});

		it('should create a BroadcastChannel with the correct name', () => {
			expect(BroadcastChannel).toHaveBeenCalledExactlyOnceWith(channelName);
		});

		describe('onLoginSuccess', () => {
			it('should set up onmessage handler', () => {
				const newBc = new BroadcastChannel(channelName);

				newBc.postMessage(loginSuccessMessage);

				expect(mockHandler).toHaveBeenCalledExactlyOnceWith();
			});

			it('should not call handler for different messages', () => {
				const newBc = new BroadcastChannel(channelName);

				newBc.postMessage('someOtherMessage');

				expect(mockHandler).not.toHaveBeenCalled();
			});

			it('should not call handler for messages from different origins', () => {
				mockOrigin.mockReturnValueOnce('https://malicious.com');

				const newBc = new BroadcastChannel(channelName);

				newBc.postMessage(loginSuccessMessage);

				expect(mockHandler).not.toHaveBeenCalled();
			});
		});

		describe('close', () => {
			it('should close the BroadcastChannel', () => {
				bc.close();

				expect(closeSpy).toHaveBeenCalledExactlyOnceWith();
			});

			it('should not close all the BroadcastChannel', () => {
				bc.close();

				expect(closeSpy).toHaveBeenCalledExactlyOnceWith();

				expect(mockHandler).not.toHaveBeenCalled();

				const newBc = new BroadcastChannel(channelName);

				newBc.postMessage(loginSuccessMessage);

				expect(mockHandler).toHaveBeenCalledExactlyOnceWith();
			});
		});

		describe('postLoginSuccess', () => {
			it('should post a login success message', () => {
				bc.postLoginSuccess();

				expect(postMessageSpy).toHaveBeenCalledExactlyOnceWith(loginSuccessMessage);
			});
		});
	});
});
