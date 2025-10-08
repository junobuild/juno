import { type SputnikActor } from '$lib/api/actors/actor.factory';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../mocks/collection.mocks';
import {
	mockSputnikObj,
	mockSputnikVersion,
	mockSputnikVersionCollection,
	mockSputnikVersionKey
} from '../mocks/sputnik.mocks';
import type { SetupFixtureCanister } from './fixtures-tests.utils';
import { type IcMgmtLog, fetchLogs } from './mgmt-tests.utils';
import { tick } from './pic-tests.utils';
import { createDoc as createDocUtils } from './satellite-doc-tests.utils';
import { waitServerlessFunction } from './satellite-extended-tests.utils';
import { uploadAsset } from './satellite-storage-tests.utils';

export const setDocAndFetchLogs = async ({
	collection,
	actor,
	pic,
	canisterId,
	controller
}: {
	collection: string;
} & SetupFixtureCanister<SputnikActor>): Promise<{
	docKey: string;
	logs: [string, IcMgmtLog][];
}> => {
	const key = await createDocUtils({
		actor,
		collection
	});

	await waitServerlessFunction(pic);

	const logs = await fetchLogs({
		canisterId,
		controller,
		pic
	});

	return {
		docKey: key,
		logs
	};
};

export const setDocAndAssertLogsLength = async ({
	collection,
	length,
	actor,
	pic,
	canisterId,
	controller
}: {
	collection: string;
	length: number;
} & SetupFixtureCanister<SputnikActor>) => {
	const { docKey, logs } = await setDocAndFetchLogs({
		collection,
		actor,
		controller,
		canisterId,
		pic
	});

	const logsWithKey = logs.filter(([_, { message }]) => message.includes(docKey));

	expect(logsWithKey).toHaveLength(length);
};

/**
 * We used to use the deprecated version() endpoint to perform ic_cdk::call in the serverless functions for testing purpose.
 * So, given it was remove, we save a document with a pseudo version and do an ic_cdl::call to get_doc.
 */
export const initVersionMock = async (actor: Actor<SputnikActor>) => {
	const { set_rule, set_doc } = actor;
	await set_rule({ Db: null }, mockSputnikVersionCollection, mockSetRule);

	await set_doc(mockSputnikVersionCollection, mockSputnikVersionKey, {
		data: await toArray(mockSputnikVersion),
		description: toNullable(),
		version: toNullable()
	});
};

export const addSomeDocsToBeListed = async ({
	collection,
	actor,
	pic,
	controller
}: { collection: string } & Omit<SetupFixtureCanister<SputnikActor>, 'canisterId'>): Promise<
	string[]
> => {
	const KEY_1 = `key-match-${nanoid()}`;
	const KEY_2 = `excluded-${nanoid()}`;
	const KEY_3 = `key-match-${nanoid()}`;
	const KEY_4 = `key-match-${nanoid()}`;
	const KEY_5 = `key-match-${nanoid()}`;

	const { set_doc } = actor;

	await set_doc(collection, KEY_1, {
		data: await toArray({
			...mockSputnikObj,
			id: 1n
		}),
		description: toNullable('desc-match'),
		version: toNullable()
	});

	await set_doc(collection, KEY_2, {
		data: await toArray({
			...mockSputnikObj,
			id: 2n
		}),
		description: toNullable('desc-match'),
		version: toNullable()
	});

	await tick(pic);

	await set_doc(collection, KEY_3, {
		data: await toArray({
			...mockSputnikObj,
			id: 3n
		}),
		description: toNullable('excluded'),
		version: toNullable()
	});

	await set_doc(collection, KEY_4, {
		data: await toArray({
			...mockSputnikObj,
			id: 4n
		}),
		description: toNullable('desc-match'),
		version: toNullable()
	});

	const user = Ed25519KeyIdentity.generate();
	actor.setIdentity(user);

	await set_doc(collection, KEY_5, {
		data: await toArray({
			...mockSputnikObj,
			id: 5n
		}),
		description: toNullable('desc-match'),
		version: toNullable()
	});

	actor.setIdentity(controller);

	return [KEY_1, KEY_2, KEY_3, KEY_4, KEY_5];
};

export const addSomeAssetsToBeListed = async ({
	collection,
	actor,
	pic,
	controller
}: { collection: string } & Omit<SetupFixtureCanister<SputnikActor>, 'canisterId'>): Promise<
	string[]
> => {
	const KEY_1 = `key-match-${nanoid()}`;
	const KEY_2 = `excluded-${nanoid()}`;
	const KEY_3 = `key-match-${nanoid()}`;
	const KEY_4 = `key-match-${nanoid()}`;
	const KEY_5 = `key-match-${nanoid()}`;

	await uploadAsset({
		name: KEY_1,
		description: 'desc-match',
		full_path: `/${collection}/${KEY_1}`,
		collection,
		actor
	});

	await uploadAsset({
		name: KEY_2,
		description: 'desc-match',
		full_path: `/${collection}/${KEY_2}`,
		collection,
		actor
	});

	await tick(pic);

	await uploadAsset({
		name: KEY_3,
		description: 'excluded',
		full_path: `/${collection}/${KEY_3}`,
		collection,
		actor
	});

	await uploadAsset({
		name: KEY_4,
		description: 'desc-match',
		full_path: `/${collection}/${KEY_4}`,
		collection,
		actor
	});

	const user = Ed25519KeyIdentity.generate();
	actor.setIdentity(user);

	await uploadAsset({
		name: KEY_5,
		description: 'desc-match',
		full_path: `/${collection}/${KEY_5}`,
		collection,
		actor
	});

	actor.setIdentity(controller);

	return [KEY_1, KEY_2, KEY_3, KEY_4, KEY_5];
};
