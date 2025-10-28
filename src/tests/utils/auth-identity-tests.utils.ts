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
import { mockClientId } from '../mocks/jwt.mocks';
import { makeMockGoogleOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';
import type { TestSession } from './satellite-auth-tests.utils';
import type { Doc } from '$declarations/satellite/satellite.did';

type UserKey = Uint8Array | number[];
type Delegations = [UserKey, SignedDelegation[]];

export const authenticateAndMakeIdentity = async ({
	pic,
	session: { sessionKey, nonce, publicKey, salt },
	satelliteActor
}: {
	pic: PocketIc;
	session: TestSession;
	satelliteActor: Actor<SatelliteActor>;
}): Promise<{
	identity: DelegationIdentity;
	delegationChain: DelegationChain;
	user: Doc
}> => {
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

	const prepareDelegation = await authenticate_user({
		OpenId: { jwt, session_key: publicKey, salt }
	});

	if ('Err' in prepareDelegation) {
		expect(true).toBeFalsy();

		throw new Error('Unreachable');
	}

	const { Ok } = prepareDelegation;

	const { public_key: userKey, doc: userDoc } = Ok;

	const signedDelegation = await get_delegation({
		OpenId: { jwt, session_key: publicKey, salt }
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
		user: userDoc
	}
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
