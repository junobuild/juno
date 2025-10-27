import type { SatelliteActor } from '$declarations';
import type { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { mockClientId } from '../../../../mocks/jwt.mocks';
import { stopCanister } from '../../../../utils/ic-management-tests.utils';
import { makeMockGoogleOpenIdJwt } from '../../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import { setupSatelliteAuth } from '../../../../utils/satellite-auth-tests.utils';
import { upgradeSatellite } from '../../../../utils/satellite-upgrade-tests.utils';

describe('Satellite > Auth > Upgrade', () => {
	let pic: PocketIc;

	let observatoryId: Principal;

	let controller: Ed25519KeyIdentity;

	let satelliteActor: Actor<SatelliteActor>;
	let satelliteId: Principal;

	let publicKey: Uint8Array;
	let nonce: string;
	let salt: Uint8Array;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor: sActor, canisterId: sId },
			observatory: { canisterId: oId },
			session: { nonce: n, publicKey: pK, salt: sT },
			controller: c
		} = await setupSatelliteAuth();

		pic = p;

		satelliteActor = sActor;
		satelliteId = sId;
		observatoryId = oId;

		controller = c;

		nonce = n;
		publicKey = pK;
		salt = sT;
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

		const { authenticate_user } = satelliteActor;

		const { delegation } = await authenticate_user({
			OpenId: { jwt, session_key: publicKey, salt }
		});

		expect('Ok' in delegation).toBeTruthy();

		// Stop the Observatory. If there is a fetch it would throw an error.
		await stopCanister({
			canisterId: observatoryId,
			pic,
			sender: controller
		});

		// Upgrade Satellite
		await upgradeSatellite({ canisterId: satelliteId, pic, controller });

		await tick(pic);

		// Try to re-authenticate
		const { delegation: newDelegation } = await authenticate_user({
			OpenId: { jwt, session_key: publicKey, salt }
		});

		expect('Ok' in newDelegation).toBeTruthy();
	});
});
