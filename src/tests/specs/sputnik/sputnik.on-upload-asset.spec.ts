import { type SputnikActor } from '$lib/api/actors/actor.factory';
import type { Identity } from '@dfinity/agent';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { type IcMgmtLog, fetchLogs } from '../../utils/mgmt-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { uploadAsset } from '../../utils/satellite-storage-tests.utils';

describe('Sputnik > on_upload_asset', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_ASSERTED_COLLECTION = 'test-on-upload-asset';
	const TEST_NOT_ASSERTED_COLLECTION = 'test';

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Storage: null }, TEST_ASSERTED_COLLECTION, mockSetRule);
		await set_rule({ Storage: null }, TEST_NOT_ASSERTED_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const upload = async ({
		collection,
		name,
		full_path
	}: {
		name: string;
		full_path: string;
		collection: string;
	}) => {
		await uploadAsset({
			full_path,
			name,
			collection,
			actor
		});
	};

	const uploadAndFetchLogs = async ({
		collection,
		name,
		full_path
	}: {
		name: string;
		full_path: string;
		collection: string;
	}): Promise<[string, IcMgmtLog][]> => {
		await upload({ collection, name, full_path });

		await waitServerlessFunction(pic);

		return await fetchLogs({
			canisterId,
			controller,
			pic
		});
	};

	const MSG = 'onUploadAsset called';
	const TRAP_MSG = 'test-async-and-trap';

	it(`should not use ${MSG}`, async () => {
		const name = 'hello.html';
		const full_path = `/${TEST_NOT_ASSERTED_COLLECTION}/${name}`;

		const logs = await uploadAndFetchLogs({
			collection: TEST_NOT_ASSERTED_COLLECTION,
			full_path,
			name
		});

		const log = logs.find(([_, { message }]) => message === MSG);

		expect(log).toBeUndefined();
	});

	it(`should use ${MSG}`, async () => {
		const name = 'hello.html';
		const full_path = `/${TEST_ASSERTED_COLLECTION}/${name}`;

		const logs = await uploadAndFetchLogs({
			collection: TEST_ASSERTED_COLLECTION,
			full_path,
			name
		});

		const log = logs.find(([_, { message }]) => message === MSG);

		expect(log).not.toBeUndefined();
	});

	it('should not trap', async () => {
		const name = 'hello-1.html';
		const full_path = `/${TEST_ASSERTED_COLLECTION}/${name}`;

		const logs = await uploadAndFetchLogs({
			collection: TEST_ASSERTED_COLLECTION,
			full_path,
			name
		});

		const log = logs.find(([_, { message }]) => message.includes(TRAP_MSG));

		expect(log).toBeUndefined();
	});

	it('should trap in hook', async () => {
		const name = 'test.html';
		const full_path = `/${TEST_ASSERTED_COLLECTION}/${name}`;

		const logs = await uploadAndFetchLogs({
			collection: TEST_ASSERTED_COLLECTION,
			full_path,
			name
		});

		const log = logs.find(([_, { message }]) => message.includes(TRAP_MSG));

		expect(log).not.toBeUndefined();
	});
});
