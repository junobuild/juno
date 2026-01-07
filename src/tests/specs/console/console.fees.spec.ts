import { type ConsoleActor, idlFactoryConsole } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { AnonymousIdentity, type Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { CONTROLLER_ERROR_MSG, TEST_FEES } from '../../constants/console-tests.constants';
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

			await expect(set_fee({ Satellite: null }, TEST_FEES)).rejects.toThrowError(
				CONTROLLER_ERROR_MSG
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
		let randomIdentityActor: Actor<ConsoleActor>;

		beforeAll(() => {
			const randomIdentity = Ed25519KeyIdentity.generate();

			randomIdentityActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
			randomIdentityActor.setIdentity(randomIdentity);
		});

		it('should throw on set_fee with user', async () => {
			const { set_fee } = randomIdentityActor;

			await expect(set_fee({ Satellite: null }, TEST_FEES)).rejects.toThrowError(
				CONTROLLER_ERROR_MSG
			);
		});

		it('should provide default segments fees', async () => {
			const { get_fee } = randomIdentityActor;

			const defaultFees = {
				fee_icp: toNullable({ e8s: 1_500_000_000n }),
				fee_cycles: { e12s: 3_000_000_000_000n },
				updated_at: expect.any(BigInt)
			};

			await expect(get_fee({ Satellite: null })).resolves.toEqual(
				expect.objectContaining(defaultFees)
			);
			await expect(get_fee({ Orbiter: null })).resolves.toEqual(
				expect.objectContaining(defaultFees)
			);
		});

		it('should provide default mission control fees', async () => {
			const { get_fee } = randomIdentityActor;

			// Mission Control cannot be spin with ICP
			const defaultFees = {
				fee_icp: toNullable(),
				fee_cycles: { e12s: 3_000_000_000_000n },
				updated_at: expect.any(BigInt)
			};

			await expect(get_fee({ MissionControl: null })).resolves.toEqual(
				expect.objectContaining(defaultFees)
			);
		});

		it('should set and provide custom fees', async () => {
			const { set_fee } = actor;

			await set_fee(
				{ Satellite: null },
				{ fee_icp: toNullable({ e8s: 33_000_000n }), fee_cycles: { e12s: 2_222_000_000_000n } }
			);
			await set_fee(
				{ Orbiter: null },
				{ fee_icp: toNullable({ e8s: 44_000_000n }), fee_cycles: { e12s: 4_444_000_000_000n } }
			);
			await set_fee(
				{ MissionControl: null },
				{ fee_icp: toNullable({ e8s: 44_000_000n }), fee_cycles: { e12s: 6_666_000_000_000n } }
			);

			const { get_fee } = randomIdentityActor;

			await expect(get_fee({ Satellite: null })).resolves.toEqual(
				expect.objectContaining({
					fee_icp: toNullable({ e8s: 33_000_000n }),
					fee_cycles: { e12s: 2_222_000_000_000n }
				})
			);
			await expect(get_fee({ Orbiter: null })).resolves.toEqual(
				expect.objectContaining({
					fee_icp: toNullable({ e8s: 44_000_000n }),
					fee_cycles: { e12s: 4_444_000_000_000n }
				})
			);
			await expect(get_fee({ MissionControl: null })).resolves.toEqual(
				expect.objectContaining({
					fee_icp: toNullable({ e8s: 44_000_000n }),
					fee_cycles: { e12s: 6_666_000_000_000n }
				})
			);
		});
	});
});
