import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { NO_ACCOUNT_ERROR_MSG } from '../../../constants/console-tests.constants';
import { setupConsole } from '../../../utils/console-tests.utils';

describe('Console > Factory > Mission Control', () => {
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

	const createMissionControlWithConsole = async (): Promise<Principal> => {
		const { create_mission_control } = actor;

		return await create_mission_control({
			subnet_id: toNullable()
		});
	};

	describe('Assertions', () => {
		let user: Ed25519KeyIdentity;

		beforeEach(() => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		it('should fail with unknown account', async () => {
			await expect(createMissionControlWithConsole()).rejects.toThrow(NO_ACCOUNT_ERROR_MSG);
		});

		it('should fail if mission control already exists', async () => {
			const { init_user_mission_control_center } = actor;

			await init_user_mission_control_center();

			await expect(createMissionControlWithConsole()).rejects.toThrow(
				'Mission control center already exist.'
			);

			actor.setIdentity(user);
		});
	});
});
