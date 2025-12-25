import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { setupConsole } from '../../../utils/console-tests.utils';
import { canisterStatus } from '../../../utils/ic-management-tests.utils';

describe('Console > Factory > Controllers', () => {
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

	const assertController = async ({
		user,
		canisterId,
		controllers
	}: {
		user: Identity;
		canisterId: Principal;
		controllers: Principal[];
	}) => {
		const result = await canisterStatus({
			sender: user,
			pic,
			canisterId
		});

		const settings = result?.settings;

		expect(settings?.controllers).toHaveLength(controllers.length);

		for (const controller of controllers) {
			expect(
				settings?.controllers.find((c) => c.toText() === controller.toText())
			).not.toBeUndefined();
		}
	};

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

	const addCredits = async ({ user }: { user: Identity }) => {
		actor.setIdentity(controller);

		// Spinning mission control requires credits or ICP as well
		const { add_credits } = actor;
		await add_credits(user.getPrincipal(), { e8s: 100_000_000n });

		actor.setIdentity(user);
	};

	describe.each([
		{
			title: 'Satellite',
			createFn: createSatelliteWithConsole
		},
		{
			title: 'Orbiter',
			createFn: createOrbiterWithConsole
		}
	])('$title', ({ createFn }) => {
		let user: Ed25519KeyIdentity;

		beforeEach(() => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		it('should have user as sole controller', async () => {
			const { get_or_init_account } = actor;
			await get_or_init_account();

			const id = await createFn({
				user
			});

			expect(id).not.toBeUndefined();

			await assertController({
				canisterId: id,
				controllers: [user.getPrincipal()],
				user
			});
		});

		it('should have user and mission control as controllers', async () => {
			const { get_or_init_account, create_mission_control } = actor;

			await get_or_init_account();

			const missionControlId = await create_mission_control({
				subnet_id: []
			});

			// Spinning mission control requires credits or ICP as well
			await addCredits({ user });

			const id = await createFn({
				user
			});

			expect(id).not.toBeUndefined();

			await assertController({
				canisterId: id,
				controllers: [user.getPrincipal(), missionControlId],
				user
			});
		});
	});
});
