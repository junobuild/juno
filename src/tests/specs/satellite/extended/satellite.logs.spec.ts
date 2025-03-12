import type { LogLevel } from '$lib/types/log';
import type {
	Doc,
	_SERVICE as TestSatelliteActor
} from '$test-declarations/test_satellite/test_satellite.did';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray } from '@junobuild/utils';
import { afterAll, beforeAll, describe, expect } from 'vitest';
import { mockSetRule } from '../../../mocks/collection.mocks';
import { mockListParams } from '../../../mocks/list.mocks';
import { tick } from '../../../utils/pic-tests.utils';
import { createDoc as createDocUtils } from '../../../utils/satellite-doc-tests.utils';
import { setupTestSatellite } from '../../../utils/fixtures-tests.utils';
import {waitServerlessFunction} from "../../../utils/satellite-extended-tests.utils";

describe('Satellite > Logging', () => {
	let pic: PocketIc;
	let actor: Actor<TestSatelliteActor>;

	const TEST_COLLECTION = 'test_logging';

	beforeAll(async () => {
		const { pic: p, actor: a } = await setupTestSatellite();

		pic = p;
		actor = a;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const createDoc = (): Promise<string> =>
		createDocUtils({
			actor,
			collection: TEST_COLLECTION
		});

	interface Log {
		level: LogLevel;
		message: string;
		timestamp: bigint;
	}

	const filterLogs = async ({
		logs,
		level
	}: {
		logs: Array<[string, Doc]>;
		level: LogLevel;
	}): Promise<Log[]> => {
		const mappedLogs = await Promise.all(logs.map(([_, doc]): Promise<Log> => fromArray(doc.data)));
		return mappedLogs.filter((log) => log.level === level);
	};

	it('should log an info when on_set_doc hook is fired', async () => {
		await createDoc();

		await waitServerlessFunction(pic);

		const { list_docs } = actor;

		const { items: logs } = await list_docs('#log', mockListParams);

		const infoLogs = await filterLogs({ logs, level: 'Info' });

		expect(infoLogs).toHaveLength(1);

		expect(infoLogs[0].message).toEqual('Hello world');
	});

	it('should log an error when on_delete_doc hook is fired', async () => {
		const { list_docs, del_doc } = actor;

		const { items } = await list_docs(TEST_COLLECTION, mockListParams);

		const [item] = items;
		const [key, doc] = item;

		await del_doc(TEST_COLLECTION, key, doc);

		await waitServerlessFunction(pic);

		const { items: logs } = await list_docs('#log', {
			...mockListParams,
			order: toNullable({
				desc: true,
				field: { CreatedAt: null }
			})
		});

		expect(logs).toHaveLength(3);

		const errorLogs = await filterLogs({ logs, level: 'Error' });

		expect(errorLogs).toHaveLength(1);

		expect(errorLogs[0].message).toEqual('Delete Hello world');
	});

	it('should create logs with different random keys', async () => {
		await Promise.all(Array.from({ length: 10 }).map(createDoc));

		await waitServerlessFunction(pic);

		const { list_docs } = actor;

		const { items: logs } = await list_docs('#log', mockListParams);

		expect(logs).toHaveLength(13);

		const keys = new Set([...logs.map(([key, _]) => key)]);
		expect(keys).toHaveLength(13);

		// Log key is format!("{}-{}", time(), nonce)
		// When we create doc and log with serverless without tick, the time should be the same
		// Therefore, without nonce, the count of entry should be smaller than the effective count of time we logged
		const trimmedKey = new Set([...logs.map(([key, _]) => key.split('-')[0])]);
		expect(trimmedKey.size).toBeLessThan(13);
	});

	it('should limit log entries to hundred', async () => {
		await Promise.all(Array.from({ length: 101 }).map(createDoc));

		await waitServerlessFunction(pic);

		const { list_docs } = actor;

		const { items: logs } = await list_docs('#log', mockListParams);

		expect(logs).toHaveLength(100);
	});
});
