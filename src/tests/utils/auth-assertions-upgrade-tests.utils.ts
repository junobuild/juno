import type { ConsoleActor, SatelliteActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { mockClientId } from '../mocks/jwt.mocks';
import type { TestSession } from './auth-tests.utils';
import { stopCanister } from './ic-management-tests.utils';
import { makeMockGoogleOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';

export const testAuthUpgrade = ({
	actor: getActor,
	controller: getController,
	pic: getPic,
	session: getSession,
	observatoryId: getObservatoryId,
	upgrade
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
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

		let publicKey: Uint8Array;
		let nonce: string;
		let salt: Uint8Array;

		beforeAll(() => {
			pic = getPic();

			actor = getActor();

			observatoryId = getObservatoryId();

			controller = getController();

			// eslint-disable-next-line prefer-destructuring
			nonce = getSession().nonce;
			// eslint-disable-next-line prefer-destructuring
			publicKey = getSession().publicKey;
			// eslint-disable-next-line prefer-destructuring
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

			const { authenticate } = actor;

			const result = await authenticate({
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
			const newResult = await authenticate({
				OpenId: { jwt, session_key: publicKey, salt }
			});

			expect('Ok' in newResult).toBeTruthy();
		});
	});
};
