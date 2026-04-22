import type { _SERVICE as TestSputnikActor } from '$test-declarations/test_sputnik/test_sputnik.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-tests.utils';

describe('Sputnik > ic-cdk > caller', () => {
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

		const { app_check_caller } = actor;
		await app_check_caller();
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const assertCaller = async (expectedLog: string) => {
		const logs = await fetchLogs({
			controller,
			canisterId,
			pic
		});

		const log = logs.find(([_, { message }]) => message.includes(expectedLog));

		expect(log).not.toBeUndefined();
	};

	it('should get and print caller ID', async () => {
		await assertCaller(`Caller ID: ${controller.getPrincipal().toText()}`);
	});

	it('should get ID as Principal', async () => {
		await assertCaller(`Caller ID is principal: true`);
	});

	it('should not get ID as anonymous', async () => {
		await assertCaller(`Caller ID is anonymous: false`);
	});
});
