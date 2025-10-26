import type { SatelliteActor } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import { DelegationChain, DelegationIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import {
	assertIdentity,
	authenticateAndMakeIdentity
} from '../../../../utils/auth-identity-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/satellite-auth-tests.utils';

describe('Satellite > Auth > Session duration', () => {
	let pic: PocketIc;

	let satelliteActor: Actor<SatelliteActor>;
	let testSatelliteActor: Actor<TestSatelliteActor>;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor },
			testSatellite: { actor: tActor },
			session: s
		} = await setupSatelliteAuth();

		pic = p;
		satelliteActor = actor;
		testSatelliteActor = tActor;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const MINUTE = 60n * 1_000_000_000n;
	const DEFAULT_MAX_TIME_TO_LIVE = 30n * MINUTE;

	describe.each([
		// { title: 'Default', maxTimeToLive: undefined },
		{ title: 'Custom', maxTimeToLive: 60n * MINUTE }
	])('$title', ({ maxTimeToLive }) => {
		let identity: DelegationIdentity;
		let delegationChain: DelegationChain;

		it('should authenticate and use identity to perform a call before expiration', async () => {
			const { identity: i, delegationChain: d } = await authenticateAndMakeIdentity({
				pic,
				session: { ...session, maxTimeToLive },
				satelliteActor
			});

			identity = i;
			delegationChain = d;

			await assertIdentity({
				testSatelliteActor,
				identity
			});
		});

		it('should fail at calling after expiration', async () => {
			await pic.advanceTime(
				Number((maxTimeToLive ?? DEFAULT_MAX_TIME_TO_LIVE) / 1_000_000n) + 1_000
			);
			await tick(pic);

			const picTime = new Date(await pic.getTime());

			const identityExpiration = new Date(
				Number(identity.getDelegation().delegations[0].delegation.expiration / BigInt(1_000_000))
			);

			const delegationExpiration = new Date(
				Number(delegationChain.delegations[0].delegation.expiration / BigInt(1_000_000))
			);

			expect(picTime.getTime()).toBeGreaterThan(identityExpiration.getTime());
			expect(picTime.getTime()).toBeGreaterThan(delegationExpiration.getTime());

			// TODO: does not work should throw an exception
			await assertIdentity({
				testSatelliteActor,
				identity
			});
		});
	});
});
