import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { OBSERVATORY_ID } from '../constants/observatory-tests.constants';
import { mockCertificateDate, mockClientId } from '../mocks/jwt.mocks';
import { generateNonce } from './auth-nonce-tests.utils';
import { setupTestSatellite } from './fixtures-tests.utils';
import { setupSatelliteStock } from './satellite-tests.utils';
import { OBSERVATORY_WASM_PATH } from './setup-tests.utils';

export interface TestSession {
	user: Ed25519KeyIdentity;
	sessionKey: ECDSAKeyIdentity;
	publicKey: Uint8Array;
	nonce: string;
	salt: Uint8Array;
}

export const setupSatelliteAuth = async (): Promise<{
	pic: PocketIc;
	controller: Ed25519KeyIdentity;
	satellite: { canisterId: Principal; actor: Actor<SatelliteActor> };
	observatory: { canisterId: Principal; actor: Actor<ObservatoryActor> };
	testSatellite: { canisterId: Principal; actor: Actor<TestSatelliteActor> };
	session: TestSession
}> => {
	// User and session
	const user = Ed25519KeyIdentity.generate();
	const sessionKey = await ECDSAKeyIdentity.generate();
	const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());
	const { nonce, salt } = await generateNonce({ caller: user });

	const {
		actor: a,
		pic: p,
		controller: cO,
		canisterId: cId
	} = await setupSatelliteStock({
		dateTime: mockCertificateDate,
		withIndexHtml: false,
		memory: { Heap: null }
	});

	const pic = p;
	const controller = cO;
	const satelliteActor = a;
	const satelliteCanisterId = cId;

	const { actor: obsA } = await pic.setupCanister<ObservatoryActor>({
		idlFactory: idlFactoryObservatory,
		wasm: OBSERVATORY_WASM_PATH,
		sender: controller.getPrincipal(),
		targetCanisterId: OBSERVATORY_ID
	});

	const observatoryActor = obsA;
	observatoryActor.setIdentity(controller);

	const { actor: testA, canisterId: testSatelliteId } = await setupTestSatellite({
		withUpgrade: false
	});

	const testSatelliteActor = testA;

	// Enable authentication with OpenID
	satelliteActor.setIdentity(controller);

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

	const { set_auth_config } = satelliteActor;
	await set_auth_config(config);

	// Start fetching OpenID Jwts in Observatory
	const { start_openid_monitoring } = observatoryActor;
	await start_openid_monitoring();

	satelliteActor.setIdentity(user);

	return {
		pic,
		controller,
		satellite: { actor: satelliteActor, canisterId: satelliteCanisterId },
		observatory: { actor: observatoryActor, canisterId: OBSERVATORY_ID },
		testSatellite: { actor: testSatelliteActor, canisterId: testSatelliteId },
		session: {
			nonce,
			publicKey,
			salt,
			sessionKey,
			user
		}
	};
};
