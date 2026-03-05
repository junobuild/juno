import type {
	AppHelloWorldArgs,
	AppHelloWorldResult,
	AppWelcomeArgs,
	AppWelcomeResult,
	_SERVICE as TestSputnikActor
} from '$test-declarations/test_sputnik/test_sputnik.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
import { mockPrincipal } from '../../../frontend/tests/mocks/identity.mock';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-tests.utils';

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

	it('should handle calls without args', async () => {
		const { app_welcome_without_args } = actor;

		const result: AppWelcomeResult = await app_welcome_without_args();

		expect(result.value).toEqual(123n);
		expect(result.caller.toText()).toEqual(canisterId.toText());
	});

	it('should handle calls to void', async () => {
		const { app_yolo } = actor;

		await expect(app_yolo()).resolves.not.toThrowError();

		const logs = await fetchLogs({
			canisterId,
			controller,
			pic
		});

		const msg = logs.find(([_, { message }]) => message.includes('No args, no result, no problem'));

		expect(msg).not.toBeUndefined();
	});
});
