import type { SatelliteActor, SatelliteDid } from '$declarations';
import type { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import { OBSERVATORY_ID } from '../../../../constants/observatory-tests.constants';
import { SATELLITE_ID } from '../../../../constants/satellite-tests.constants';
import { mockClientId } from '../../../../mocks/jwt.mocks';
import { authenticateAndMakeIdentity } from '../../../../utils/auth-identity-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/satellite-auth-tests.utils';

describe('Satellite > Auth > Session duration', () => {
	let pic: PocketIc;

	let controller: Ed25519KeyIdentity;

	let satelliteId: Principal;
	let satelliteActor: Actor<SatelliteActor>;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor, canisterId: cId },
			session: s,
			controller: c
		} = await setupSatelliteAuth();

		pic = p;

		controller = c;

		satelliteActor = actor;
		satelliteId = cId;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const configAuthTargets = async ({
		version,
		targets
	}: {
		version: bigint;
		targets?: Principal[];
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
							targets: toNullable(targets)
						}
					]
				}
			],
			version: [version]
		};

		await set_auth_config(config);

		satelliteActor.setIdentity(session.user);
	};

	it('should sign a delegation with default targets to satellite ID', async () => {
		const { identity, delegationChain } = await authenticateAndMakeIdentity({
			pic,
			session,
			satelliteActor
		});

		const identityTargets = identity.getDelegation().delegations[0].delegation.targets;
		const delegationTargets = delegationChain.delegations[0].delegation.targets;

		expect(identityTargets).toHaveLength(1);
		expect(delegationTargets).toHaveLength(1);

		expect(identityTargets?.[0].toText()).toEqual(satelliteId.toText());
		expect(delegationTargets?.[0].toText()).toEqual(satelliteId.toText());
	});

	it('should sign a delegation with no targets - works with any canister', async () => {
		await configAuthTargets({
			version: 1n,
			targets: undefined
		});

		const { identity, delegationChain } = await authenticateAndMakeIdentity({
			pic,
			session,
			satelliteActor
		});

		const identityTargets = identity.getDelegation().delegations[0].delegation.targets;
		const delegationTargets = delegationChain.delegations[0].delegation.targets;

		expect(identityTargets).toBeUndefined();
		expect(delegationTargets).toBeUndefined();
	});

	it('should sign a delegation with empty targets - works with no canister', async () => {
		await configAuthTargets({
			version: 2n,
			targets: []
		});

		const { identity, delegationChain } = await authenticateAndMakeIdentity({
			pic,
			session,
			satelliteActor
		});

		const identityTargets = identity.getDelegation().delegations[0].delegation.targets;
		const delegationTargets = delegationChain.delegations[0].delegation.targets;

		assertNonNullish(identityTargets);
		assertNonNullish(delegationTargets);

		expect(identityTargets).toHaveLength(0);
		expect(delegationTargets).toHaveLength(0);
	});

	it('should sign a delegation with targets', async () => {
		await configAuthTargets({
			version: 3n,
			targets: [OBSERVATORY_ID, SATELLITE_ID]
		});

		const { identity, delegationChain } = await authenticateAndMakeIdentity({
			pic,
			session,
			satelliteActor
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

		expect(identityTargets?.find((p) => p.toText() === SATELLITE_ID.toText())).not.toBeUndefined();
		expect(
			delegationTargets?.find((p) => p.toText() === SATELLITE_ID.toText())
		).not.toBeUndefined();
	});
});
