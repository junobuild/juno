import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Signature } from '@dfinity/agent';
import {
	Delegation,
	DelegationChain,
	DelegationIdentity,
	ECDSAKeyIdentity,
	Ed25519KeyIdentity,
	type SignedDelegation
} from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { OBSERVATORY_ID } from '../../../../constants/observatory-tests.constants';
import { mockCertificateDate, mockClientId } from '../../../../mocks/jwt.mocks';
import { generateNonce } from '../../../../utils/auth-nonce-tests.utils';
import { setupTestSatellite } from '../../../../utils/fixtures-tests.utils';
import { makeMockGoogleOpenIdJwt } from '../../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../../../utils/setup-tests.utils';

describe('Satellite > Auth > Delegation identity', async () => {
	let pic: PocketIc;

	let observatoryActor: Actor<ObservatoryActor>;
	let testSatelliteActor: Actor<TestSatelliteActor>;

	let actor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;

	const user = Ed25519KeyIdentity.generate();
	const sessionKey = await ECDSAKeyIdentity.generate();
	const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());
	const { nonce, salt } = await generateNonce({ caller: user });

	beforeAll(async () => {
		const {
			actor: a,
			pic: p,
			controller: cO
		} = await setupSatelliteStock({
			dateTime: mockCertificateDate,
			withIndexHtml: false,
			memory: { Heap: null }
		});

		pic = p;
		actor = a;
		controller = cO;

		const { actor: obsA } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal(),
			targetCanisterId: OBSERVATORY_ID
		});

		observatoryActor = obsA;
		observatoryActor.setIdentity(controller);

		const { actor: testA } = await setupTestSatellite({ withUpgrade: false });

		testSatelliteActor = testA;

		// Enable authentication with OpenID
		actor.setIdentity(controller);

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [],
			rules: [],
			openid: [
				{
					providers: [[{ Google: null }, { client_id: mockClientId }]]
				}
			],
			version: [1n]
		};

		const { set_auth_config } = actor;
		await set_auth_config(config);

		// Start fetching OpenID Jwts in Observatory
		const { start_openid_monitoring } = observatoryActor;
		await start_openid_monitoring();

		actor.setIdentity(user);
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

		const { authenticate_user, get_delegation } = actor;

		const { delegation: prepareDelegation } = await authenticate_user({
			OpenId: { jwt, session_key: publicKey, salt, max_time_to_live: [] }
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
					delegation: new Delegation(Uint8Array.from(delegation.pubkey), delegation.expiration),
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
