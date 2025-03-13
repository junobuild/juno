import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
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
