import type { _SERVICE as TestSputnikActor } from '$test-declarations/test_sputnik/test_sputnik.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';

describe('Sputnik > HTTP Request', () => {
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

	it('should perform a GET request with headers', async () => {
		const { app_http_world_request } = actor;

		await app_http_world_request({
			url: 'https://example.com',
			method: { GET: null },
			headers: [{ name: 'Content-Type', value: 'application/json' }],
			body: []
		});
	});
});
