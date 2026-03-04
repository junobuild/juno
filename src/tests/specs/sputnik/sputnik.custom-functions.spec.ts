import type {
	AppHelloWorldArgs,
	AppHelloWorldResult,
	_SERVICE as TestSputnikActor
} from '$test-declarations/test_sputnik/test_sputnik.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { Principal } from '@icp-sdk/core/principal';
import { mockPrincipal } from '../../../frontend/tests/mocks/identity.mock';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';

describe('Sputnik > Custom Functions', () => {
	let pic: PocketIc;
	let actor: Actor<TestSputnikActor>;

	beforeAll(async () => {
		const { pic: p, actor: a } = await setupTestSputnik();

		pic = p;
		actor = a;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should call the custom function', async () => {
		const { app_hello_world } = actor;

		const args: AppHelloWorldArgs = {
			value: mockPrincipal
		};

		await expect(app_hello_world(args)).resolves.not.toThrowError();
	});

	it('should get a result from the custom function', async () => {
		const { app_hello_world } = actor;

		const args: AppHelloWorldArgs = {
			value: mockPrincipal
		};

		const result: AppHelloWorldResult = await app_hello_world(args);

		expect(result.text).toEqual('Welcome');
		expect(result.value.toText()).toEqual(mockPrincipal.toText());
		expect(Principal.isPrincipal(result.value)).toBeTruthy();
	});
});
