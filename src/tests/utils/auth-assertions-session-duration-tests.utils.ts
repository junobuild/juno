import type { ConsoleActor, SatelliteActor, SatelliteDid } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type {
	DelegationChain,
	DelegationIdentity,
	Ed25519KeyIdentity
} from '@icp-sdk/core/identity';
import { mockClientId } from '../mocks/jwt.mocks';
import { assertIdentity, authenticateAndMakeIdentity } from './auth-identity-tests.utils';
import type { TestSession } from './auth-tests.utils';
import { tick } from './pic-tests.utils';

export const testAuthSessionDuration = ({
	actor: getActor,
	controller: getController,
	pic: getPic,
	testSatelliteActor: getTestSatelliteActor,
	session: getSession
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	testSatelliteActor: () => Actor<TestSatelliteActor>;
	controller: () => Ed25519KeyIdentity;
	pic: () => PocketIc;
	session: () => TestSession;
}) => {
	describe('Session duration', () => {
		const MINUTE = 60n * 1_000_000_000n;
		const DEFAULT_MAX_TIME_TO_LIVE = 24n * 60n * MINUTE; // A day

		let pic: PocketIc;

		let actor: Actor<SatelliteActor | ConsoleActor>;
		let controller: Ed25519KeyIdentity;

		let testSatelliteActor: Actor<TestSatelliteActor>;

		let session: TestSession;

		beforeAll(() => {
			pic = getPic();
			actor = getActor();
			controller = getController();
			testSatelliteActor = getTestSatelliteActor();
			session = getSession();
		});

		const configAuthExpiration = async ({
			version,
			maxTimeToLive
		}: {
			version: bigint;
			maxTimeToLive?: bigint;
		}) => {
			const { set_auth_config } = actor;

			actor.setIdentity(controller);

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [],
				rules: [],
				openid: [
					{
						providers: [
							[
								{ Google: null },
								{
									client_id: mockClientId,
									delegation: [
										{
											targets: toNullable(),
											max_time_to_live: toNullable(maxTimeToLive)
										}
									]
								}
							]
						],
						observatory_id: []
					}
				],
				version: [version]
			};

			await set_auth_config(config);

			actor.setIdentity(session.user);
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
					actor
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
};
