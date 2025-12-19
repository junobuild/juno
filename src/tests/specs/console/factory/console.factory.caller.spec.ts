import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { NO_ACCOUNT_ERROR_MSG } from '../../../constants/console-tests.constants';
import { setupConsole } from '../../../utils/console-tests.utils';

describe('Console > Factory > Caller', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			pic: p,
			actor: c,
			controller: cO
		} = await setupConsole({
			withApplyRateTokens: false,
			withLedger: true,
			withSegments: true
		});

		pic = p;

		controller = cO;

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const createSatelliteWithConsole = async ({ user }: { user: Identity }): Promise<Principal> => {
		const { create_satellite } = actor;

		return await create_satellite({
			user: user.getPrincipal(),
			block_index: toNullable(),
			name: toNullable(),
			storage: toNullable(),
			subnet_id: toNullable()
		});
	};

	const createOrbiterWithConsole = async ({ user }: { user: Identity }): Promise<Principal> => {
		const { create_orbiter } = actor;

		return await create_orbiter({
			user: user.getPrincipal(),
			block_index: toNullable(),
			name: toNullable(),
			subnet_id: toNullable()
		});
	};

	describe.each([
		{ title: 'Satellite', createFn: createSatelliteWithConsole },
		{ title: 'Orbiter', createFn: createOrbiterWithConsole }
	])('$title', ({ createFn }) => {
		let user: Ed25519KeyIdentity;

		beforeAll(() => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		it('should fail with unknown caller if no user and no mission control', async () => {
			await expect(
				createFn({
					user
				})
			).rejects.toThrow(NO_ACCOUNT_ERROR_MSG);
		});
	});
});
