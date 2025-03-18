import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { type Actor, PocketIc } from '@hadronous/pic';
import { afterAll, beforeAll, describe, inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { setDocAndFetchLogs } from '../../utils/sputnik-tests.utils';
import {nanoid} from "nanoid";
import {fromArray, toArray} from "@junobuild/utils";
import {mockSputnikObj, type SputnikMock, type SputnikTestListDocs} from "../../mocks/sputnik.mocks";
import {assertNonNullish, fromNullable, toNullable} from "@dfinity/utils";
import {waitServerlessFunction} from "../../utils/satellite-extended-tests.utils";

describe('Sputnik > ic-cdk > call', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'demo-ic-cdk-call';
	const MOCK_COLLECTION = "demo";

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Db: null }, MOCK_COLLECTION, mockSetRule);

		await addSomeDocsToBeListed();
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const addSomeDocsToBeListed = async () => {
		const { set_doc } = actor;

		await set_doc(MOCK_COLLECTION, nanoid(), {
			data: await toArray(mockSputnikObj),
			description: toNullable(),
			version: toNullable()
		});

		await set_doc(MOCK_COLLECTION, nanoid(), {
			data: await toArray(mockSputnikObj),
			description: toNullable(),
			version: toNullable()
		});
	}

	it("should make a call to list documents", async () => {
		const { set_doc, get_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_COLLECTION, key, {
			data: [],
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);

		const result = await get_doc(TEST_COLLECTION, key);

		const doc = fromNullable(result);

		assertNonNullish(doc);

		const data: SputnikTestListDocs = await fromArray(doc.data);

		expect(data.items_length).toEqual(2n);
		expect(data.matches_length).toEqual(2n);
		expect(data.items_page).toEqual(0n);
	})
});
