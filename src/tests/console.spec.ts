import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from './constants/console-tests.constants';
import { deploySegments, initMissionControls } from './utils/console-tests.utils';
import { CONSOLE_WASM_PATH } from './utils/setup-tests.utils';

describe('Console', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactorConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		await deploySegments(actor);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	describe('owner', () => {
		it('should throw errors if too many users are created quickly', async () => {
			await expect(
				async () => await initMissionControls({ actor, pic, length: 2 })
			).rejects.toThrowError(new RegExp('Rate limit reached, try again later', 'i'));
		});
	});

	describe('anonymous', () => {
		beforeEach(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on list payments', async () => {
			const { list_payments } = actor;

			await expect(list_payments()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on withdraw payments', async () => {
			const { withdraw_payments } = actor;

			await expect(withdraw_payments()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	});

	describe('random', () => {
		const randomCaller = Ed25519KeyIdentity.generate();

		beforeEach(() => {
			actor.setIdentity(randomCaller);
		});

		it('should throw errors on list payments', async () => {
			const { list_payments } = actor;

			await expect(list_payments()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on withdraw payments', async () => {
			const { withdraw_payments } = actor;

			await expect(withdraw_payments()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	});
});
