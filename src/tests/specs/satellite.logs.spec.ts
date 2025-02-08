import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import { idlFactory as idlTestFactorySatellite } from '$test-declarations/test_satellite/test_satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray } from '@junobuild/utils';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { mockSetRule } from './mocks/collection.mocks';
import { mockListParams } from './mocks/list.mocks';
import { tick } from './utils/pic-tests.utils';
import { createDoc as createDocUtils } from './utils/satellite-doc-tests.utils';
import { controllersInitArgs, TEST_SATELLITE_WASM_PATH } from './utils/setup-tests.utils';

describe('Satellite Logging', () => {
	let pic: PocketIc;
	let actor: Actor<TestSatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const TEST_COLLECTION = 'test_logging';

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c, canisterId } = await pic.setupCanister<TestSatelliteActor>({
			idlFactory: idlTestFactorySatellite,
			wasm: TEST_SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		await tick(pic);

		// The random number generator is only initialized on upgrade because dev that do not use serverless functions do not need it
		await pic.upgradeCanister({
			canisterId,
			wasm: TEST_SATELLITE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		// Wait for post_upgrade to kicks in since we defer instantiation of random
		await tick(pic);

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const waitServerlessFunction = async () => {
		// Wait for the serverless function to being fired
		await tick(pic);
	};

	const createDoc = (): Promise<string> =>
		createDocUtils({
			actor,
			collection: TEST_COLLECTION
		});

	it('should log an info when on_set_doc hook is fired', async () => {
		await createDoc();

		await waitServerlessFunction();

		const { list_docs } = actor;

		const { items: logs } = await list_docs('#log', mockListParams);

		expect(logs).toHaveLength(1);

		const [log, _] = logs;
		const [__, doc] = log;

		const data = await fromArray(doc.data);

		expect(data).toEqual({
			data: null,
			level: 'Info',
			message: 'Hello world'
		});
	});

	it('should log an error when on_delete_doc hook is fired', async () => {
		const { list_docs, del_doc } = actor;

		const { items } = await list_docs(TEST_COLLECTION, mockListParams);

		const [item] = items;
		const [key, doc] = item;

		await del_doc(TEST_COLLECTION, key, doc);

		await waitServerlessFunction();

		const { items: logs } = await list_docs('#log', {
			...mockListParams,
			order: toNullable({
				desc: true,
				field: { CreatedAt: null }
			})
		});

		expect(logs).toHaveLength(2);

		const [log, _] = logs;
		const [__, docLog] = log;

		const data = await fromArray(docLog.data);

		expect(data).toEqual({
			data: null,
			level: 'Error',
			message: 'Delete Hello world'
		});
	});

	it('should create logs with different random keys', async () => {
		await Promise.all(Array.from({ length: 10 }).map(createDoc));

		await waitServerlessFunction();

		const { list_docs } = actor;

		const { items: logs } = await list_docs('#log', mockListParams);

		expect(logs).toHaveLength(12);

		const keys = new Set([...logs.map(([key, _]) => key)]);
		expect(keys).toHaveLength(12);

		// Log key is format!("{}-{}", time(), nonce)
		// When we create doc and log with serverless without tick, the time should be the same
		// Therefore, without nonce, the count of entry should be smaller than the effective count of time we logged
		const trimmedKey = new Set([...logs.map(([key, _]) => key.split('-')[0])]);
		expect(trimmedKey.size).toBeLessThan(12);
	});

	it('should limit log entries to hundred', async () => {
		await Promise.all(Array.from({ length: 101 }).map(createDoc));

		await waitServerlessFunction();

		const { list_docs } = actor;

		const { items: logs } = await list_docs('#log', mockListParams);

		expect(logs).toHaveLength(100);
	});
});
