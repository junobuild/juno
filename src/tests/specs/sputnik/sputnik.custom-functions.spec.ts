import type {
	InputArgs,
	_SERVICE as TestSputnikActor
} from '$test-declarations/test_sputnik/test_sputnik.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { mockPrincipal } from '../../../frontend/tests/mocks/identity.mock';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';

describe('Sputnik > Custom Functions', () => {
	let pic: PocketIc;
	let actor: Actor<TestSputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should call the custom hello world', async () => {
		const { hello_world } = actor;

		const args: InputArgs = {
			value: mockPrincipal
		};

		await expect(hello_world(args)).resolves.not.toThrowError();
	});
});
