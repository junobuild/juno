import type { ConsoleActor, SatelliteActor, SatelliteDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { OBSERVATORY_ID } from '../constants/observatory-tests.constants';
import { SATELLITE_ID } from '../constants/satellite-tests.constants';
import { mockClientId } from '../mocks/jwt.mocks';
import { authenticateAndMakeIdentity } from './auth-identity-tests.utils';
import type { TestSession } from './auth-tests.utils';

export const testAuthTargets = ({
	actor: getActor,
	controller: getController,
	pic: getPic,
	session: getSession,
	canisterId: getCanisterId
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	canisterId: () => Principal;
	controller: () => Ed25519KeyIdentity;
	pic: () => PocketIc;
	session: () => TestSession;
}) => {
	describe('Targets', () => {
		let pic: PocketIc;

		let controller: Ed25519KeyIdentity;

		let canisterId: Principal;
		let actor: Actor<SatelliteActor | ConsoleActor>;

		let session: TestSession;

		beforeAll(() => {
			pic = getPic();
			controller = getController();
			actor = getActor();
			canisterId = getCanisterId();
			session = getSession();
		});

		const configAuthTargets = async ({
			version,
			targets
		}: {
			version: bigint;
			targets: [] | [Principal[]];
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
											targets,
											max_time_to_live: toNullable()
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

		it('should sign a delegation with default targets to satellite ID', async () => {
			const { identity, delegationChain } = await authenticateAndMakeIdentity({
				pic,
				session,
				actor
			});

			const identityTargets = identity.getDelegation().delegations[0].delegation.targets;
			const delegationTargets = delegationChain.delegations[0].delegation.targets;

			expect(identityTargets).toHaveLength(1);
			expect(delegationTargets).toHaveLength(1);

			expect(identityTargets?.[0].toText()).toEqual(canisterId.toText());
			expect(delegationTargets?.[0].toText()).toEqual(canisterId.toText());
		});

		it('should sign a delegation with no targets - works with any canister', async () => {
			await configAuthTargets({
				version: 1n,
				targets: [] // None
			});

			const { identity, delegationChain } = await authenticateAndMakeIdentity({
				pic,
				session,
				actor
			});

			const identityTargets = identity.getDelegation().delegations[0].delegation.targets;
			const delegationTargets = delegationChain.delegations[0].delegation.targets;

			expect(identityTargets).toBeUndefined();
			expect(delegationTargets).toBeUndefined();
		});

		it('should sign a delegation with empty targets - defaults to satellite ID', async () => {
			await configAuthTargets({
				version: 2n,
				targets: [[]]
			});

			const { identity, delegationChain } = await authenticateAndMakeIdentity({
				pic,
				session,
				actor
			});

			const identityTargets = identity.getDelegation().delegations[0].delegation.targets;
			const delegationTargets = delegationChain.delegations[0].delegation.targets;

			assertNonNullish(identityTargets);
			assertNonNullish(delegationTargets);

			expect(identityTargets).toHaveLength(1);
			expect(delegationTargets).toHaveLength(1);

			expect(identityTargets?.[0].toText()).toEqual(canisterId.toText());
			expect(delegationTargets?.[0].toText()).toEqual(canisterId.toText());
		});

		it('should sign a delegation with targets', async () => {
			await configAuthTargets({
				version: 3n,
				targets: [[OBSERVATORY_ID, SATELLITE_ID]]
			});

			const { identity, delegationChain } = await authenticateAndMakeIdentity({
				pic,
				session,
				actor
			});

			const identityTargets = identity.getDelegation().delegations[0].delegation.targets;
			const delegationTargets = delegationChain.delegations[0].delegation.targets;

			expect(identityTargets).toHaveLength(2);
			expect(delegationTargets).toHaveLength(2);

			expect(
				identityTargets?.find((p) => p.toText() === OBSERVATORY_ID.toText())
			).not.toBeUndefined();
			expect(
				delegationTargets?.find((p) => p.toText() === OBSERVATORY_ID.toText())
			).not.toBeUndefined();

			expect(
				identityTargets?.find((p) => p.toText() === SATELLITE_ID.toText())
			).not.toBeUndefined();
			expect(
				delegationTargets?.find((p) => p.toText() === SATELLITE_ID.toText())
			).not.toBeUndefined();
		});
	});
};
