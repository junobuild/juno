import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { OBSERVATORY_ID } from '../../../../constants/observatory-tests.constants';
import { mockCertificateDate, mockClientId } from '../../../../mocks/jwt.mocks';
import { generateNonce } from '../../../../utils/auth-nonce-tests.utils';
import { stopCanister } from '../../../../utils/ic-management-tests.utils';
import { makeMockGoogleOpenIdJwt } from '../../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';
import { upgradeSatellite } from '../../../../utils/satellite-upgrade-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../../../utils/setup-tests.utils';

describe('Satellite > Auth > Upgrade', async () => {
	let pic: PocketIc;

	let observatoryActor: Actor<ObservatoryActor>;
	let observatoryCanisterId: Principal;

	let actor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;
	let canisterId: Principal;

	const user = Ed25519KeyIdentity.generate();
	const sessionKey = await ECDSAKeyIdentity.generate();
	const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());
	const { nonce, salt } = await generateNonce({ caller: user });

	beforeAll(async () => {
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

		pic = p;
		actor = a;
		controller = cO;
		canisterId = cId;

		const { actor: obsA, canisterId: obsC } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal(),
			targetCanisterId: OBSERVATORY_ID
		});

		observatoryActor = obsA;
		observatoryCanisterId = obsC;

		observatoryActor.setIdentity(controller);

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

	it('should use cached certificate after upgrade', async () => {
		await pic.advanceTime(15 * 60_000);
		await tick(pic);

		// Authenticate
		const now = await pic.getTime();

		const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
			clientId: mockClientId,
			date: new Date(now),
			nonce
		});

		await assertOpenIdHttpsOutcalls({ pic, jwks });

		const { authenticate_user } = actor;

		const { delegation } = await authenticate_user({
			OpenId: { jwt, session_key: publicKey, salt, max_time_to_live: [] }
		});

		expect('Ok' in delegation).toBeTruthy();

		// Stop the Observatory. If there is a fetch it would throw an error.
		await stopCanister({
			canisterId: observatoryCanisterId,
			pic,
			sender: controller
		});

		// Upgrade Satellite
		await upgradeSatellite({ canisterId, pic, controller });

		await tick(pic);

		// Try to re-authenticate
		const { delegation: newDelegation } = await authenticate_user({
			OpenId: { jwt, session_key: publicKey, salt, max_time_to_live: [] }
		});

		expect('Ok' in newDelegation).toBeTruthy();
	});
});
