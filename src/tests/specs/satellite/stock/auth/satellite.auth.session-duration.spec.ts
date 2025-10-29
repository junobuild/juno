import type { SatelliteActor, SatelliteDid } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { DelegationChain, DelegationIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { mockClientId } from '../../../../mocks/jwt.mocks';
import {
	assertIdentity,
	authenticateAndMakeIdentity
} from '../../../../utils/auth-identity-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/auth-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';

describe('Satellite > Auth > Session duration', () => {
	let pic: PocketIc;

	let controller: Ed25519KeyIdentity;

	let satelliteActor: Actor<SatelliteActor>;
	let testSatelliteActor: Actor<TestSatelliteActor>;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor },
			testSatellite: { actor: tActor },
			session: s,
			controller: c
		} = await setupSatelliteAuth();

		pic = p;

		satelliteActor = actor;
		testSatelliteActor = tActor;

		controller = c;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const MINUTE = 60n * 1_000_000_000n;
	const DEFAULT_MAX_TIME_TO_LIVE = 24n * 60n * MINUTE; // A day

	const configAuthExpiration = async ({
		version,
		maxTimeToLive
	}: {
		version: bigint;
		maxTimeToLive?: bigint;
	}) => {
		const { set_auth_config } = satelliteActor;

		satelliteActor.setIdentity(controller);

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [],
			rules: [],
			openid: [
				{
					providers: [
						[
							{ Google: null },
							{
								client_id: mockClientId
							}
						]
					],
					observatory_id: [],
					delegation: [
						{
							targets: toNullable(),
							max_time_to_live: toNullable(maxTimeToLive)
						}
					]
				}
			],
			version: [version]
		};

		await set_auth_config(config);

		satelliteActor.setIdentity(session.user);
	};

	describe.each([
		{ title: 'Default', advanceTime: 0, maxTimeToLive: undefined, version: 1n },
		{ title: 'Custom', advanceTime: 15 * 60_000, maxTimeToLive: 60n * MINUTE, version: 2n }
	])('$title', ({ maxTimeToLive, version, advanceTime }) => {
		let identity: DelegationIdentity;
		let delegationChain: DelegationChain;

		it('should authenticate and use identity to perform a call before expiration', async () => {
			await configAuthExpiration({
				version,
				maxTimeToLive
			});

			if (advanceTime > 0) {
				await pic.advanceTime(advanceTime);
				await tick(pic);
			}

			const { identity: i, delegationChain: d } = await authenticateAndMakeIdentity({
				pic,
				session,
				actor: satelliteActor
			});

			identity = i;
			delegationChain = d;

			await assertIdentity({
				testSatelliteActor,
				identity
			});
		});

		it('should be expired', async () => {
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

			// TODO: calling a canister is currently impersonated by PicJS and therefore,
			// we cannot use the generated delegation that is now expired
			// to perform a call and assert it fails.
			// await assertIdentity({
			// 	testSatelliteActor,
			//  identity
			// });
		});
	});
});
