import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { fromNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs, type IcMgmtLog } from '../../utils/mgmt-test.utils';
import { uploadAsset } from '../../utils/satellite-storage-tests.utils';

describe('Sputnik > assert_upload_asset', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_ASSERTED_COLLECTION = 'test-assert-upload-asset';
	const TEST_NOT_ASSERTED_COLLECTION = 'test';

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

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

		return await fetchLogs({
			canisterId,
			controller,
			pic
		});
	};

	const MSG = 'assertUploadAsset called';

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

	it('should assert asset can be uploaded', async () => {
		const name = 'hello-1.html';
		const full_path = `/${TEST_ASSERTED_COLLECTION}/${name}`;

		await expect(
			upload({ collection: TEST_ASSERTED_COLLECTION, name, full_path })
		).resolves.not.toThrowError();

		const { get_asset } = actor;

		const asset = fromNullable(await get_asset(TEST_ASSERTED_COLLECTION, full_path));

		expect(asset).not.toBeUndefined();
	});

	it('should prevent asset to be deleted', async () => {
		// The fixture disallow editing asset if it contains a name equals to "test.html"
		const name = 'test.html';
		const full_path = `/${TEST_ASSERTED_COLLECTION}/${name}`;

		await expect(
			upload({ collection: TEST_ASSERTED_COLLECTION, name, full_path })
		).rejects.toThrowError(new RegExp('test.html name not allowed', 'i'));

		const { get_asset } = actor;

		const asset = fromNullable(await get_asset(TEST_ASSERTED_COLLECTION, full_path));

		expect(asset).toBeUndefined();
	});
});
