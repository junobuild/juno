import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { mockCertificateDate, mockClientId } from '../../../../mocks/jwt.mocks';
import { generateNonce } from '../../../../utils/auth-nonce-tests.utils';
import { makeMockGoogleOpenIdJwt } from '../../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../../../utils/setup-tests.utils';
import { testAuthConfigObservatory } from '../../../../utils/auth-assertions-config-openid-tests.utils';

describe('Satellite > Authentication > Config', async () => {
	let pic: PocketIc;

	let actor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;

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
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	testAuthConfigObservatory({
		pic: () => pic,
		actor: () => actor,
		controller: () => controller,
	})
});
