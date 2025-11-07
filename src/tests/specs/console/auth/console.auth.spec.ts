import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import {
	testAuthConfig,
	testAuthGoogleConfig,
	testReturnAuthConfig
} from '../../../utils/auth-assertions-tests.utils';
import { setupConsole } from '../../../utils/console-tests.utils';

describe('Console > Authentication', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let canisterId: Principal;
	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const { pic: p, actor: c, canisterId: cId, controller: cO } = await setupConsole({});

		pic = p;
		actor = c;
		canisterId = cId;
		controller = cO;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		testAuthConfig({
			actor: () => actor
		});

		testReturnAuthConfig({
			actor: () => actor,
			pic: () => pic,
			canisterId: () => canisterId,
			controller: () => controller,
			version: 4n
		});

		testAuthGoogleConfig({
			actor: () => actor,
			pic: () => pic,
			canisterId: () => canisterId,
			controller: () => controller,
			version: 5n
		});
	});
});
