import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { AnonymousIdentity, type Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { createSatelliteWithConsole } from '../../utils/console-factory-tests.utils';
import { setupConsole } from '../../utils/console-tests.utils';

describe('Console > Segments', () => {
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

	describe('Errors', () => {
		const assertNoAccountGuard = async () => {
			const { list_segments } = actor;

			await expect(
				list_segments({
					segment_type: [],
					segment_id: []
				})
			).rejects.toThrowError('User does not have an account.');
		};

		it('should not list segments if anonymous', async () => {
			actor.setIdentity(new AnonymousIdentity());
			await assertNoAccountGuard();
		});

		it('should not list segments for some identity', async () => {
			actor.setIdentity(Ed25519KeyIdentity.generate());
			await assertNoAccountGuard();
		});
	});

	describe('User', () => {
		let user: Identity;

		beforeAll(async () => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			const { get_or_init_account } = actor;
			await get_or_init_account();

			await createSatelliteWithConsole({ user, actor });
		});

		it('should list segments if user has an account', async () => {
			const { list_segments } = actor;

			const segments = await list_segments({
				segment_type: [],
				segment_id: []
			});

			expect(segments).toHaveLength(1);
		});
	});
});
