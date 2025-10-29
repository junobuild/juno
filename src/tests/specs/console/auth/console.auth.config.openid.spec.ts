import { type ConsoleActor } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { mockCertificateDate } from '../../../mocks/jwt.mocks';
import { testAuthConfigObservatory } from '../../../utils/auth-assertions-config-openid-tests.utils';
import { setupConsole } from '../../../utils/console-tests.utils';

describe('Console > Authentication > Config', async () => {
	let pic: PocketIc;

	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			actor: a,
			pic: p,
			controller: cO
		} = await setupConsole({
			dateTime: mockCertificateDate
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
