import type {
	AppHttpRequestArgs,
	AppHttpRequestResult,
	_SERVICE as TestSputnikActor
} from '$test-declarations/test_sputnik/test_sputnik.did';
import { idlFactory as idlTestFactorySputnik } from '$test-declarations/test_sputnik/test_sputnik.factory.did';
import type { DeferredActor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, jsonReplacer } from '@dfinity/utils';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { toBodyJson } from '../../utils/orbiter-tests.utils';

describe('Sputnik > ic_cdk > http_request', () => {
	let pic: PocketIc;
	let actor: DeferredActor<TestSputnikActor>;

	const baseArgs: AppHttpRequestArgs = {
		url: 'https://example.com',
		method: { GET: null },
		headers: [],
		body: [],
		max_response_bytes: [],
		transform: [],
		is_replicated: [false]
	};

	const performHttpRequest = async ({
		args
	}: {
		args: AppHttpRequestArgs;
	}): Promise<AppHttpRequestResult> => {
		const { app_http_request } = actor;

		const executeHttpRequest = await app_http_request(args);

		// tick for two rounds to allow the canister message to be processed
		// and for the HTTPS Outcall to be queued
		await pic.tick(2);

		const [pendingHttpOutCall] = await pic.getPendingHttpsOutcalls();
		assertNonNullish(pendingHttpOutCall);

		const { requestId, subnetId } = pendingHttpOutCall;

		await pic.mockPendingHttpsOutcall({
			requestId,
			subnetId,
			response: {
				type: 'success',
				body: toBodyJson({ hello: 'world' }),
				statusCode: 200,
				headers: []
			}
		});

		return await executeHttpRequest();
	};

	beforeAll(async () => {
		const { pic: p, canisterId, controller } = await setupTestSputnik();
		pic = p;

		actor = pic.createDeferredActor<TestSputnikActor>(idlTestFactorySputnik, canisterId);

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should perform a GET request', async () => {
		const result = await performHttpRequest({ args: baseArgs });

		expect(result.status).toEqual(200n);
		expect(result.body).toBeDefined();
	});

	it('should perform a GET request with headers', async () => {
		const args = {
			...baseArgs,
			headers: [{ name: 'Accept', value: 'application/json' }]
		};

		const result = await performHttpRequest({ args });

		expect(result.status).toEqual(200n);
	});

	it('should perform a GET request with max response bytes', async () => {
		const result = await performHttpRequest({
			args: {
				...baseArgs,
				max_response_bytes: [2000n]
			}
		});

		expect(result.status).toEqual(200n);
	});

	it('should perform a POST request with a body', async () => {
		const result = await performHttpRequest({
			args: {
				...baseArgs,
				method: { POST: null },
				headers: [{ name: 'Content-Type', value: 'application/json' }],
				body: [new TextEncoder().encode(JSON.stringify({ hello: 'world' }, jsonReplacer))]
			}
		});

		expect(result.status).toEqual(200n);
	});

	it('should perform a HEAD request', async () => {
		const result = await performHttpRequest({
			args: {
				...baseArgs,
				method: { HEAD: null }
			}
		});

		expect(result.status).toEqual(200n);
	});

	it('should perform a GET request with transform', async () => {
		const result = await performHttpRequest({
			args: {
				...baseArgs,
				transform: ['myHttpTransform']
			}
		});

		expect(result.status).toEqual(200n);
		expect(result.headers).toEqual([]);
	});
});
