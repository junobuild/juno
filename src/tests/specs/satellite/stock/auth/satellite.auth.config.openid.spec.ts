import type { SatelliteActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { mockCertificateDate } from '../../../../mocks/jwt.mocks';
import { testAuthConfigObservatory } from '../../../../utils/auth-assertions-config-openid-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';

describe('Satellite > Authentication > Config', () => {
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
