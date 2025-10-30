import type { ConsoleActor } from '$declarations';
import type { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { mockCertificateDate } from '../../../mocks/jwt.mocks';
import { testAuthPrepareDelegation } from '../../../utils/auth-assertions-prepare-delegation-tests.utils';
import { deploySegments, setupConsole } from '../../../utils/console-tests.utils';

describe('Console > Auth > Delegation', () => {
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

		actor.setIdentity(controller);

		await deploySegments({ actor, withOrbiter: false, withSatellite: false });
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	testAuthPrepareDelegation({
		pic: () => pic,
		actor: () => actor,
		controller: () => controller
	});
});
