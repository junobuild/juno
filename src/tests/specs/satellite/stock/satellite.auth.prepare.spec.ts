import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { inject } from 'vitest';
import { OBSERVATORY_ID } from '../../../constants/observatory-tests.constants';
import { mockCertificateDate, mockJwt } from '../../../mocks/observatory.mocks';
import { setupSatelliteStock } from '../../../utils/satellite-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Authentication > Prepare', () => {
	let pic: PocketIc;

	let observatoryActor: Actor<ObservatoryActor>;

	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;
	let canisterIdUrl: string;

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(mockCertificateDate.getTime());

		const {
			actor: a,
			canisterId: c,
			pic: p,
			controller: cO,
			canisterIdUrl: url
		} = await setupSatelliteStock();

		pic = p;
		canisterId = c;
		actor = a;
		controller = cO;
		canisterIdUrl = url;

		const { actor: obsA } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal(),
			targetCanisterId: OBSERVATORY_ID
		});

		observatoryActor = obsA;
		observatoryActor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Authenticate user fails', async () => {
		const user = Ed25519KeyIdentity.generate();

		const sessionKey = await ECDSAKeyIdentity.generate();
		const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());
		const salt = crypto.getRandomValues(new Uint8Array(32));

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should fail when authentication is not configured', async () => {
			const { authenticate_user } = actor;

			await expect(
				authenticate_user({
					OpenId: {
						jwt: mockJwt,
						session_key: publicKey,
						salt
					}
				})
			).rejects.toThrow('No authentication configuration found.');
		});

		it('should fail when openid configuration is not set', async () => {
			const { set_auth_config, authenticate_user } = actor;

			actor.setIdentity(controller);

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [],
				rules: [],
				openid: [],
				version: []
			};

			await set_auth_config(config);

			actor.setIdentity(user);

			await expect(
				authenticate_user({
					OpenId: {
						jwt: mockJwt,
						session_key: publicKey,
						salt
					}
				})
			).rejects.toThrow('Authentication with OpenId disabled.');
		});
	});
});
