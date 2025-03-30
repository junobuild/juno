import { LOCAL_REPLICA_URL } from '$lib/constants/app.constants';
import { initSignerContext } from '$lib/stores/signer.store';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Signer } from '@dfinity/oisy-wallet-signer/signer';
import { get } from 'svelte/store';

describe('SignerContext', () => {
	const identity = Ed25519KeyIdentity.generate();

	it('initializes the signer with the owner identity and registers methods', () => {
		const { init } = initSignerContext();

		const spy = vi.spyOn(Signer, 'init');

		init({ owner: identity });

		expect(spy).toHaveBeenCalledWith({
			owner: identity,
			host: LOCAL_REPLICA_URL
		});
	});

	describe('accounts', () => {
		it('payload should be undefined per default', () => {
			const { accountsPrompt } = initSignerContext();

			const payload = get(accountsPrompt.payload);
			expect(payload).toBeUndefined();
		});

		// TODO: cover prompt registration and usage with E2E tests

		it('payload should be null after reset', () => {
			const { accountsPrompt, reset } = initSignerContext();

			reset();

			const payload = get(accountsPrompt.payload);
			expect(payload).toBeNull();
		});
	});

	describe('permissions', () => {
		it('payload should be undefined per default', () => {
			const { permissionsPrompt } = initSignerContext();

			const payload = get(permissionsPrompt.payload);
			expect(payload).toBeUndefined();
		});

		// TODO: cover prompt registration and usage with E2E tests

		it('payload should be null after reset', () => {
			const { permissionsPrompt, reset } = initSignerContext();

			reset();

			const payload = get(permissionsPrompt.payload);
			expect(payload).toBeNull();
		});
	});

	describe('consentMessage', () => {
		it('payload should be undefined per default', () => {
			const { consentMessagePrompt } = initSignerContext();

			const payload = get(consentMessagePrompt.payload);
			expect(payload).toBeUndefined();
		});

		// TODO: cover prompt registration and usage with E2E tests

		it('payload should be null after reset', () => {
			const { consentMessagePrompt, reset } = initSignerContext();

			reset();

			const payload = get(consentMessagePrompt.payload);
			expect(payload).toBeNull();
		});
	});

	describe('callCanister', () => {
		it('payload should be undefined per default', () => {
			const { callCanisterPrompt } = initSignerContext();

			const payload = get(callCanisterPrompt.payload);
			expect(payload).toBeUndefined();
		});

		// TODO: cover prompt registration and usage with E2E tests

		it('payload should be null after reset', () => {
			const { callCanisterPrompt, reset } = initSignerContext();

			reset();

			const payload = get(callCanisterPrompt.payload);
			expect(payload).toBeNull();
		});
	});
});
