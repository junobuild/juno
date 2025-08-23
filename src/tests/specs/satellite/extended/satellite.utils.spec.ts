import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Identity } from '@dfinity/agent';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../../mocks/collection.mocks';
import { setupTestSatellite } from '../../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../../utils/mgmt-tests.utils';
import { waitServerlessFunction } from '../../../utils/satellite-extended-tests.utils';

describe('Satellite > Utils', () => {
	let pic: PocketIc;
	let actor: Actor<TestSatelliteActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test_utils';

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSatellite();

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

	const mockData = {
		hello: 12367894n
	};

	const createDoc = async (): Promise<string> => {
		const key = nanoid();

		const { set_doc } = actor;

		const data = await toArray(mockData);

		await set_doc(TEST_COLLECTION, key, {
			data,
			description: toNullable(),
			version: toNullable()
		});

		return key;
	};

	const getDocData = async (key: string): Promise<typeof mockData> => {
		const { get_doc } = actor;

		const result = await get_doc(TEST_COLLECTION, key);

		const doc = fromNullable(result);

		assertNonNullish(doc);

		return await fromArray(doc.data);
	};

	describe('BigInt', () => {
		it('should deserialize', async () => {
			await createDoc();

			await waitServerlessFunction(pic);

			const logs = await fetchLogs({
				pic,
				controller,
				canisterId
			});

			const log = logs.find(([_, { message }]) => message === `BigInt decoded: ${mockData.hello}`);

			expect(log).not.toBeUndefined();
		});

		it('should serialize', async () => {
			const key = await createDoc();

			await waitServerlessFunction(pic);

			const data = await getDocData(key);

			expect(data.hello).toEqual(mockData.hello + 1n);
		});
	});
});
