import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { NO_ACCOUNT_ERROR_MSG } from '../../../constants/console-tests.constants';
import { setupConsole } from '../../../utils/console-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

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
			withApplyRateTokens: true,
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
	])('$title', ({ title, createFn }) => {
		let user: Ed25519KeyIdentity;

		beforeEach(() => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		it('should fail with unknown account', async () => {
			await expect(
				createFn({
					user
				})
			).rejects.toThrow(NO_ACCOUNT_ERROR_MSG);
		});

		it('should fail with no mission control', async () => {
			const { get_or_init_account } = actor;
			await get_or_init_account();

			const anotherCaller = Ed25519KeyIdentity.generate();
			actor.setIdentity(anotherCaller);

			await expect(
				createFn({
					user
				})
			).rejects.toThrow("'No mission control center found");

			actor.setIdentity(user);
		});

		it('should fail with unknown caller', async () => {
			const { init_user_mission_control_center } = actor;

			await init_user_mission_control_center();

			const anotherCaller = Ed25519KeyIdentity.generate();
			actor.setIdentity(anotherCaller);

			await expect(
				createFn({
					user
				})
			).rejects.toThrow("'Unknown caller");

			actor.setIdentity(user);
		});

		it('should create with user', async () => {
			const { get_or_init_account, list_segments } = actor;
			await get_or_init_account();

			const id = await createFn({
				user
			});

			expect(id).not.toBeUndefined();

			const segments = await list_segments({
				segment_type: [title === 'Orbiter' ? { Orbiter: null } : { Satellite: null }],
				segment_id: [id]
			});

			expect(segments).toHaveLength(1);

			expect(segments[0][1].segment_id.toText()).toEqual(id.toText());
		});

		it('should fail with user without credits and payment', async () => {
			const { get_or_init_account } = actor;
			await get_or_init_account();

			// First module works out
			await createFn({
				user
			});

			await pic.advanceTime(60_000);
			await tick(pic);

			// Second requires payment
			await expect(
				createFn({
					user
				})
			).rejects.toThrow('InsufficientAllowance');
		});
	});
});
