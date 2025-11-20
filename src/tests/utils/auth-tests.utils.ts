import {
	idlFactoryObservatory,
	type ConsoleActor,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { OBSERVATORY_ID } from '../constants/observatory-tests.constants';
import { mockCertificateDate, mockClientId } from '../mocks/jwt.mocks';
import { generateNonce } from './auth-nonce-tests.utils';
import { deploySegments, setupConsole } from './console-tests.utils';
import { setupTestSatellite } from './fixtures-tests.utils';
import { updateRateConfigNoLimit } from './rate.tests.utils';
import { setupSatelliteStock } from './satellite-tests.utils';
import { OBSERVATORY_WASM_PATH } from './setup-tests.utils';

export interface TestSession {
	user: Ed25519KeyIdentity;
	sessionKey: ECDSAKeyIdentity;
	publicKey: Uint8Array;
	nonce: string;
	salt: Uint8Array;
}

interface SetupAuth {
	pic: PocketIc;
	controller: Ed25519KeyIdentity;
	observatory: { canisterId: Principal; actor: Actor<ObservatoryActor> };
	testSatellite: { canisterId: Principal; actor: Actor<TestSatelliteActor> };
	session: TestSession;
}

export const setupSatelliteAuth = async (): Promise<
	SetupAuth & {
		satellite: { canisterId: Principal; actor: Actor<SatelliteActor> };
	}
> => {
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

	const common = await setupAuth({
		pic,
		controller,
		actor: satelliteActor
	});

	return {
		...common,
		satellite: { canisterId: satelliteCanisterId, actor: satelliteActor }
	};
};

export const setupConsoleAuth = async (
	{ withApplyRateTokens }: { withApplyRateTokens?: boolean } = { withApplyRateTokens: true }
): Promise<
	SetupAuth & {
		console: { canisterId: Principal; actor: Actor<ConsoleActor> };
	}
> => {
	const {
		actor: a,
		pic: p,
		controller: cO,
		canisterId: cId
	} = await setupConsole({
		dateTime: mockCertificateDate,
		withApplyRateTokens
	});

	const pic = p;
	const controller = cO;
	const consoleActor = a;
	const consoleCanisterId = cId;

	consoleActor.setIdentity(controller);

	await deploySegments({
		actor: consoleActor,
		withSatellite: false,
		withOrbiter: false
	});

	const common = await setupAuth({
		pic,
		controller,
		actor: consoleActor
	});

	return {
		...common,
		console: { canisterId: consoleCanisterId, actor: consoleActor }
	};
};

const setupAuth = async ({
	pic,
	controller,
	actor
}: {
	pic: PocketIc;
	controller: Ed25519KeyIdentity;
	actor: Actor<SatelliteActor> | Actor<ConsoleActor>;
}): Promise<SetupAuth> => {
	// User and session
	const user = Ed25519KeyIdentity.generate();
	const sessionKey = await ECDSAKeyIdentity.generate();
	const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());
	const { nonce, salt } = await generateNonce({ caller: user });

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
	actor.setIdentity(controller);

	const config: SatelliteDid.SetAuthenticationConfig = {
		internet_identity: [],
		rules: [],
		openid: [
			{
				providers: [[{ Google: null }, { client_id: mockClientId, delegation: [] }]],
				observatory_id: []
			}
		],
		version: [1n]
	};

	const { set_auth_config } = actor;
	await set_auth_config(config);

	// Start fetching OpenID Jwts in Observatory
	const { start_openid_monitoring } = observatoryActor;
	await start_openid_monitoring();

	await updateRateConfigNoLimit({ actor: observatoryActor });

	actor.setIdentity(user);

	return {
		pic,
		controller,
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
