import { AuthBroadcastChannel } from '$lib/providers/auth-broadcast.provider';

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
		const loginSuccessMessage = {
			msg: AuthBroadcastChannel.MESSAGE_LOGIN_SUCCESS,
			emitterId: window.crypto.randomUUID()
		};

		const postMessageSpy = vi.fn();
		const closeSpy = vi.fn();

		const mockOrigin = vi.fn().mockReturnValue(mockUrl);

		const mockChannels = new Map<string, BroadcastChannel>();

		const mockHandler = vi.fn();

		beforeEach(() => {
			vi.clearAllMocks();

			// eslint-disable-next-line local-rules/prefer-object-params, @typescript-eslint/no-explicit-any
			const MockBroadcastChannelConstructor = vi.fn(function (this: any, name: string) {
				this.name = name;
				this.onmessage = null;
				this.postMessage = postMessageSpy;
				this.close = closeSpy;

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
			});

			vi.stubGlobal('BroadcastChannel', MockBroadcastChannelConstructor);

			bc = AuthBroadcastChannel.getInstance();

			bc.onLoginSuccess(mockHandler);
		});

		afterEach(() => {
			bc.destroy();

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

			it('should not call handler for totally different messages', () => {
				const newBc = new BroadcastChannel(channelName);

				newBc.postMessage({
					...loginSuccessMessage,
					emitterId: bc.__test__only__emitter_id__
				});

				expect(mockHandler).not.toHaveBeenCalled();
			});

			it('should not call handler for same emitter ID if not supported message', () => {
				const newBc = new BroadcastChannel(channelName);

				newBc.postMessage({
					...loginSuccessMessage,
					msg: 'someOtherMessage'
				});

				expect(mockHandler).not.toHaveBeenCalled();
			});

			it('should not call handler for different messages payload', () => {
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
				bc.destroy();

				expect(closeSpy).toHaveBeenCalledExactlyOnceWith();
			});

			it('should not close all the BroadcastChannel', () => {
				bc.destroy();

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

				expect(postMessageSpy).toHaveBeenCalledExactlyOnceWith({
					...loginSuccessMessage,
					emitterId: bc.__test__only__emitter_id__
				});
			});
		});
	});
});
