import type { SatelliteActor } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Signature } from '@dfinity/agent';
import {
	Delegation,
	DelegationChain,
	DelegationIdentity,
	type ECDSAKeyIdentity,
	type SignedDelegation
} from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable } from '@dfinity/utils';
import { mockClientId } from '../../../../mocks/jwt.mocks';
import { makeMockGoogleOpenIdJwt } from '../../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import { setupSatelliteAuth } from '../../../../utils/satellite-auth-tests.utils';

describe('Satellite > Auth > Delegation identity', () => {
	let pic: PocketIc;

	let satelliteActor: Actor<SatelliteActor>;
	let testSatelliteActor: Actor<TestSatelliteActor>;

	let publicKey: Uint8Array;
	let nonce: string;
	let salt: Uint8Array;
	let sessionKey: ECDSAKeyIdentity;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor },
			testSatellite: { actor: tActor },
			session: { nonce: n, publicKey: pK, salt: sT, sessionKey: sK }
		} = await setupSatelliteAuth();

		pic = p;
		satelliteActor = actor;
		testSatelliteActor = tActor;

		nonce = n;
		publicKey = pK;
		salt = sT;
		sessionKey = sK;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	type UserKey = Uint8Array | number[];
	type Delegations = [UserKey, SignedDelegation[]];

	const generateIdentity = ({
		delegations,
		sessionKey
	}: {
		delegations: Delegations;
		sessionKey: ECDSAKeyIdentity;
	}): {
		identity: DelegationIdentity;
		delegationChain: DelegationChain;
	} => {
		const [userKey, signedDelegations] = delegations;

		const delegationChain = DelegationChain.fromDelegations(
			signedDelegations,
			Uint8Array.from(userKey)
		);

		const identity = DelegationIdentity.fromDelegation(sessionKey, delegationChain);

		return { identity, delegationChain };
	};

	it('should auhenticate, get delegation and use identity to perform a call', async () => {
		await pic.advanceTime(15 * 60_000);
		await tick(pic);

		const now = await pic.getTime();

		const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
			clientId: mockClientId,
			date: new Date(now),
			nonce
		});

		await assertOpenIdHttpsOutcalls({ pic, jwks });

		const { authenticate_user, get_delegation } = satelliteActor;

		const { delegation: prepareDelegation } = await authenticate_user({
			OpenId: { jwt, session_key: publicKey, salt }
		});

		if ('Err' in prepareDelegation) {
			expect(true).toBeFalsy();

			return;
		}

		const { Ok } = prepareDelegation;

		const [userKey, expiration] = Ok;

		const signedDelegation = await get_delegation({
			OpenId: { jwt, session_key: publicKey, salt, expiration }
		});

		if ('Err' in signedDelegation) {
			expect(true).toBeFalsy();

			return;
		}

		const {
			Ok: { delegation, signature }
		} = signedDelegation;

		const delegations: Delegations = [
			userKey,
			[
				{
					delegation: new Delegation(
						Uint8Array.from(delegation.pubkey),
						delegation.expiration,
						fromNullable(delegation.targets)
					),
					signature: Uint8Array.from(signature) as unknown as Signature
				}
			]
		];

		const { identity } = generateIdentity({
			sessionKey,
			delegations
		});

		testSatelliteActor.setIdentity(identity);

		const { whoami } = testSatelliteActor;

		const principal = await whoami();

		expect(principal.toText()).toEqual(identity.getPrincipal().toString());
	});
});
