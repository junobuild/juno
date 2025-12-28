import { type ConsoleActor, idlFactoryConsole } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { AnonymousIdentity, type Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { createSatelliteWithConsole } from '../../utils/console-factory-tests.utils';
import { setupConsole } from '../../utils/console-tests.utils';

describe('Console > Fees', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;
	let canisterId: Principal;

	beforeAll(async () => {
		const {
			pic: p,
			actor: c,
			controller: cO,
			canisterId: cId
		} = await setupConsole({
			withApplyRateTokens: false,
			withLedger: false,
			withSegments: true
		});

		pic = p;
		controller = cO;
		canisterId = cId;

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Errors', () => {
		const assertGuard = async (identity: Identity) => {
			const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
			newActor.setIdentity(identity);

			const { set_fee } = newActor;

			await expect(set_fee({ Satellite: null }, { fee_icp: { e8s: 33_000_000n } })).rejects.toThrow(
				'Caller is not a controller of the console.'
			);
		};

		it('should throw on set_fee with some identity', async () => {
			await assertGuard(Ed25519KeyIdentity.generate());
		});

		it('should throw on set_fee with anonymous identity', async () => {
			await assertGuard(new AnonymousIdentity());
		});
	});

	describe('With user', () => {
		let user: Ed25519KeyIdentity;
		let userActor: Actor<ConsoleActor>;

		beforeAll(async () => {
			user = Ed25519KeyIdentity.generate();

			userActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
			userActor.setIdentity(user);

			const { get_or_init_account } = userActor;

			await get_or_init_account();

			// Create satellite to use credits
			await createSatelliteWithConsole({ user, actor });

			actor.setIdentity(controller);
		});

		it('should throw on set_fee with user', async () => {
			const { set_fee } = userActor;

			await expect(set_fee({ Satellite: null }, { fee_icp: { e8s: 33_000_000n } })).rejects.toThrow(
				'Caller is not a controller of the console.'
			);
		});

		it('should provide default fees', async () => {
			const { get_create_fee } = userActor;

			await expect(get_create_fee({ Satellite: null }, { ICP: null })).resolves.toEqual(
				toNullable({ e8s: 50_000_000n })
			);
			await expect(get_create_fee({ Orbiter: null }, { ICP: null })).resolves.toEqual(
				toNullable({ e8s: 50_000_000n })
			);
			await expect(get_create_fee({ MissionControl: null }, { ICP: null })).resolves.toEqual(
				toNullable({ e8s: 50_000_000n })
			);
		});

		it('should set and provide custom fees', async () => {
			const { set_fee } = actor;

			await set_fee({ Satellite: null }, { fee_icp: { e8s: 33_000_000n } });
			await set_fee({ Orbiter: null }, { fee_icp: { e8s: 44_000_000n } });
			await set_fee({ MissionControl: null }, { fee_icp: { e8s: 44_000_000n } });

			const { get_create_fee } = userActor;

			await expect(get_create_fee({ Satellite: null }, { ICP: null })).resolves.toEqual(
				toNullable({ e8s: 33_000_000n })
			);
			await expect(get_create_fee({ Orbiter: null }, { ICP: null })).resolves.toEqual(
				toNullable({ e8s: 44_000_000n })
			);
			await expect(get_create_fee({ MissionControl: null }, { ICP: null })).resolves.toEqual(
				toNullable({ e8s: 44_000_000n })
			);
		});
	});
});
