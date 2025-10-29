import type { SatelliteActor } from '$declarations';
import type { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { mockCertificateDate } from '../../../../mocks/jwt.mocks';
import { testAuthConfigObservatory } from '../../../../utils/auth-assertions-config-openid-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';

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
		controller: () => controller
	});
});
