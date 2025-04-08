import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import { toNullable } from '@dfinity/utils';
import type { Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { mockSetRule } from '../mocks/collection.mocks';
import {
	mockSputnikVersion,
	mockSputnikVersionCollection,
	mockSputnikVersionKey
} from '../mocks/sputnik.mocks';
import type { SetupFixtureCanister } from './fixtures-tests.utils';
import { fetchLogs, type IcMgmtLog } from './mgmt-test.utils';
import { createDoc as createDocUtils } from './satellite-doc-tests.utils';
import { waitServerlessFunction } from './satellite-extended-tests.utils';

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

	expect(logsWithKey.length).toEqual(length);
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
