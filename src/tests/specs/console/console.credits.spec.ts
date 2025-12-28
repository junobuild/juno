import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { createSatelliteWithConsole } from '../../utils/console-factory-tests.utils';
import { setupConsole } from '../../utils/console-tests.utils';

describe('Console > Credits', () => {
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

	describe('User', () => {
		let user: Identity;

		beforeAll(async () => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			const { get_or_init_account } = actor;
			await get_or_init_account();
		});

		it('should have remaining credits', async () => {
			const { get_credits } = actor;

			const credits = await get_credits();

			expect(credits).toEqual({ e8s: 100_000_000n });
		});

		it('should have zero fee if remaining credits', async () => {
			const { get_create_fee } = actor;

			const fee = await get_create_fee({ Satellite: null }, { ICP: null });

			expect(fee).toEqual(toNullable());
		});

		it('should create a first satellite and used all credits', async () => {
			const satellite_id = await createSatelliteWithConsole({ user, actor });

			expect(satellite_id).not.toBeUndefined();

			const { get_credits } = actor;

			const credits = await get_credits();

			expect(credits).toEqual({ e8s: 0n });
		});

		it('should get fees with no more credits', async () => {
			const { get_create_fee } = actor;

			const satFee = await get_create_fee({ Satellite: null }, { ICP: null });

			expect(satFee).toEqual(toNullable({ e8s: 50_000_000n }));

			const orbFee = await get_create_fee({ Satellite: null }, { ICP: null });

			expect(orbFee).toEqual(toNullable({ e8s: 50_000_000n }));
		});

		it('should not create a satellite without credits', async () => {
			// No credits -> with payments -> no ICP
			await expect(createSatelliteWithConsole({ user, actor })).rejects.toThrow(
				'InsufficientAllowance'
			);
		});

		it('should receive credits', async () => {
			actor.setIdentity(controller);

			const { add_credits } = actor;
			await add_credits(user.getPrincipal(), { e8s: 200_000_000n });

			actor.setIdentity(user);

			const { get_credits } = actor;

			const credits = await get_credits();

			expect(credits).toEqual({ e8s: 200_000_000n });
		});

		it('should create a satellite and used some credits', async () => {
			// Advance time to skip: Rate limit reached, try again later.
			await pic.advanceTime(1_000 * 60 * 10);

			const satellite_id = await createSatelliteWithConsole({ user, actor });

			expect(satellite_id).not.toBeUndefined();

			const { get_credits } = actor;

			const credits = await get_credits();

			expect(credits).toEqual({ e8s: 100_000_000n });
		});
	});
});
