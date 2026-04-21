import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { CONTROLLER_ERROR_MSG } from '../../constants/console-tests.constants';
import { setupConsole } from '../../utils/console-tests.utils';

describe('Console > Economy', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			pic: p,
			actor: c,
			controller: cO
		} = await setupConsole({
			withApplyRateTokens: true,
			withLedger: true,
			withSegments: true,
			withFee: true
		});

		pic = p;

		controller = cO;

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const assertGuards = () => {
		it('should throw errors on list payments', async () => {
			const { list_icp_payments, list_icrc_payments } = actor;

			await expect(list_icp_payments()).rejects.toThrow(CONTROLLER_ERROR_MSG);
			await expect(list_icrc_payments()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on withdraw payments', async () => {
			const { withdraw_icp, withdraw_icrc } = actor;

			await expect(withdraw_icp({ to: controller.getPrincipal() })).rejects.toThrow(
				CONTROLLER_ERROR_MSG
			);
			await expect(withdraw_icrc({ to: controller.getPrincipal() })).rejects.toThrow(
				CONTROLLER_ERROR_MSG
			);
		});
	};

	describe('anonymous', () => {
		beforeEach(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		assertGuards();
	});

	describe('random', () => {
		const randomCaller = Ed25519KeyIdentity.generate();

		beforeEach(() => {
			actor.setIdentity(randomCaller);
		});

		assertGuards();
	});
});
