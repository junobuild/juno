import type { LogLevel } from '$lib/types/log';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish } from '@dfinity/utils';
import { type PocketIc , type Actor } from '@hadronous/pic';
import { fromArray } from '@junobuild/utils';
import { afterAll, beforeAll, describe, expect } from 'vitest';
import { mockSetRule } from '../../../mocks/collection.mocks';
import { mockListParams } from '../../../mocks/list.mocks';
import { setupTestSatellite, upgradeTestSatellite } from '../../../utils/fixtures-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

describe('Satellite > Hooks > Random', () => {
	let pic: PocketIc;
	let actor: Actor<TestSatelliteActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test_logging';

	beforeAll(async () => {
		const {
			pic: p,
			actor: a,
			canisterId: cId,
			controller: c
		} = await setupTestSatellite({ withUpgrade: false });

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should not call on init_random_seed on init', async () => {
		const { list_docs } = actor;

		const { items: logs } = await list_docs('#log', mockListParams);

		expect(logs.length).toEqual(0);
	});

	it('should call on init_random_seed after upgrade', async () => {
		await upgradeTestSatellite({
			pic,
			controller,
			canisterId
		});

		await tick(pic);

		const { list_docs } = actor;

		const { items: logs } = await list_docs('#log', mockListParams);

		expect(logs.length).toEqual(1);

		const [log] = logs;
		const [__, doc] = log;

		interface Log {
			level: LogLevel;
			message: string;
			data: Uint8Array | number[] | undefined;
			timestamp: bigint;
		}

		const data: Log = await fromArray(doc.data);

		expect(data).toEqual(
			expect.objectContaining({
				level: 'Warning',
				message: 'Random initialized'
			})
		);

		assertNonNullish(data?.data);

		const value = await fromArray(data.data);

		expect(typeof value).toEqual('number');
	});
});
