import type { ConsoleActor, SatelliteActor } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable } from '@dfinity/utils';
import type { Signature } from '@icp-sdk/core/agent';
import {
	Delegation,
	DelegationChain,
	DelegationIdentity,
	type ECDSAKeyIdentity,
	type SignedDelegation
} from '@icp-sdk/core/identity';
import { mockClientId } from '../mocks/jwt.mocks';
import type { TestSession } from './auth-tests.utils';
import { makeMockGoogleOpenIdJwt, type MockOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';

type UserKey = Uint8Array;
type Delegations = [UserKey, SignedDelegation[]];

export const authenticateAndMakeIdentity = async <R>({
	pic,
	session: { sessionKey, nonce, publicKey, salt },
	actor
}: {
	pic: PocketIc;
	session: TestSession;
	actor: Actor<SatelliteActor | ConsoleActor>;
}): Promise<
	{
		identity: DelegationIdentity;
		delegationChain: DelegationChain;
		jwt: MockOpenIdJwt;
	} & R
> => {
	await pic.advanceTime(15 * 60_000);
	await tick(pic);

	const now = await pic.getTime();

	const mockJwt = await makeMockGoogleOpenIdJwt({
		clientId: mockClientId,
		date: new Date(now),
		nonce
	});

	const { jwks, jwt } = mockJwt;

	await assertOpenIdHttpsOutcalls({ pic, jwks });

	const { authenticate, get_delegation } = actor;

	const prepareDelegation = await authenticate({
		OpenId: { jwt, session_key: publicKey, salt }
	});

	if ('Err' in prepareDelegation) {
		expect(true).toBeFalsy();

		throw new Error('Unreachable');
	}

	const { Ok } = prepareDelegation;

	const {
		delegation: { expiration, user_key: userKey },
		...rest
	} = Ok;

	const signedDelegation = await get_delegation({
		OpenId: { jwt, session_key: publicKey, salt, expiration }
	});

	if ('Err' in signedDelegation) {
		expect(true).toBeFalsy();

		throw new Error('Unreachable');
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

	const identity = generateIdentity({
		sessionKey,
		delegations
	});

	return {
		...identity,
		...(rest as R),
		jwt: mockJwt
	};
};

export const assertIdentity = async ({
	testSatelliteActor,
	identity
}: {
	identity: DelegationIdentity;
	testSatelliteActor: Actor<TestSatelliteActor>;
}) => {
	testSatelliteActor.setIdentity(identity);

	const { whoami } = testSatelliteActor;

	const principal = await whoami();

	expect(principal.toText()).toEqual(identity.getPrincipal().toString());
};

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
