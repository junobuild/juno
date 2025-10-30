import { type ConsoleActor, type SatelliteActor } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { mockClientId } from '../mocks/jwt.mocks';
import { type TestSession } from './auth-tests.utils';
import { stopCanister } from './ic-management-tests.utils';
import { makeMockGoogleOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';

export const testAuthUpgrade = ({
	actor: getActor,
	controller: getController,
	pic: getPic,
	session: getSession,
	canisterId: getCanisterId,
	observatoryId: getObservatoryId,
	upgrade
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	canisterId: () => Principal;
	controller: () => Ed25519KeyIdentity;
	pic: () => PocketIc;
	session: () => TestSession;
	observatoryId: () => Principal;
	upgrade: () => Promise<void>;
}) => {
	describe('Upgrade', () => {
		let pic: PocketIc;

		let observatoryId: Principal;

		let controller: Ed25519KeyIdentity;

		let actor: Actor<SatelliteActor | ConsoleActor>;
		let canisterId: Principal;

		let publicKey: Uint8Array;
		let nonce: string;
		let salt: Uint8Array;

		beforeAll(async () => {
			pic = getPic();

			actor = getActor();
			canisterId = getCanisterId();

			observatoryId = getObservatoryId();

			controller = getController();

			nonce = getSession().nonce;
			publicKey = getSession().publicKey;
			salt = getSession().salt;
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

			const result = await authenticate_user({
				OpenId: { jwt, session_key: publicKey, salt }
			});

			expect('Ok' in result).toBeTruthy();

			// Stop the Observatory. If there is a fetch it would throw an error.
			await stopCanister({
				canisterId: observatoryId,
				pic,
				sender: controller
			});

			await upgrade();

			await tick(pic);

			// Try to re-authenticate
			const newResult = await authenticate_user({
				OpenId: { jwt, session_key: publicKey, salt }
			});

			expect('Ok' in newResult).toBeTruthy();
		});
	});
};
