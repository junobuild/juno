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
import { mockClientId } from '../mocks/jwt.mocks';
import { makeMockGoogleOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';
import type { TestSession } from './satellite-auth-tests.utils';
import { toNullable } from '@dfinity/utils';

type UserKey = Uint8Array | number[];
type Delegations = [UserKey, SignedDelegation[]];

export const authenticateAndMakeIdentity = async ({
	pic,
	session: { sessionKey, nonce, publicKey, salt, maxTimeToLive },
	satelliteActor
}: {
	pic: PocketIc;
	session: TestSession & { maxTimeToLive?: bigint};
	satelliteActor: Actor<SatelliteActor>;
}): Promise<{
	identity: DelegationIdentity;
	delegationChain: DelegationChain;
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

	const { delegation: prepareDelegation } = await authenticate_user({
		OpenId: { jwt, session_key: publicKey, salt, max_time_to_live: toNullable(maxTimeToLive) }
	});

	if ('Err' in prepareDelegation) {
		expect(true).toBeFalsy();
		throw new Error('Unreachable');
	}

	const { Ok } = prepareDelegation;

	const [userKey, expiration] = Ok;

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
				delegation: new Delegation(Uint8Array.from(delegation.pubkey), delegation.expiration),
				signature: Uint8Array.from(signature) as unknown as Signature
			}
		]
	];

	return generateIdentity({
		sessionKey,
		delegations
	});
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
