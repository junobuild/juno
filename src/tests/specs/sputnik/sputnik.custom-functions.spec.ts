import type {
	AppHelloWorldArgs,
	AppHelloWorldResult,
	AppWelcomeArgs,
	AppWelcomeResult,
	_SERVICE as TestSputnikActor
} from '$test-declarations/test_sputnik/test_sputnik.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { Principal } from '@icp-sdk/core/principal';
import { mockPrincipal } from '../../../frontend/tests/mocks/identity.mock';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';

describe('Sputnik > Custom Functions', () => {
	let pic: PocketIc;
	let actor: Actor<TestSputnikActor>;
	let canisterId: Principal;

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should call a custom function', async () => {
		const { app_hello_world } = actor;

		const args: AppHelloWorldArgs = {
			value: mockPrincipal
		};

		await expect(app_hello_world(args)).resolves.not.toThrowError();
	});

	it('should get a result from a custom function', async () => {
		const { app_hello_world } = actor;

		const args: AppHelloWorldArgs = {
			value: mockPrincipal
		};

		const result: AppHelloWorldResult = await app_hello_world(args);

		expect(result.text).toEqual('Welcome');
		expect(result.value.toText()).toEqual(mockPrincipal.toText());
		expect(Principal.isPrincipal(result.value)).toBeTruthy();
	});

	it('should handle async calls', async () => {
		const { app_welcome } = actor;

		const args: AppWelcomeArgs = {
			value: 'yolo'
		};

		const result: AppWelcomeResult = await app_welcome(args);

		expect(result.value).toEqual(123n);
		expect(result.caller.toText()).toEqual(canisterId.toText());
	});
});
