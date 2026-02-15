import type { SatelliteDid } from '$declarations';
import type { RunId, Workflow, WorkflowKey } from '$lib/types/workflow';
import { fromArray } from '@junobuild/utils';

export const toKeyWorkflow = async ([key, { data: dataArray, ...rest }]: [
	string,
	SatelliteDid.Doc
]): Promise<[WorkflowKey, Workflow]> => [
	key as WorkflowKey,
	{
		data: await fromArray(dataArray),
		...rest
	}
];

export const toRunId = (key: WorkflowKey): RunId => {
	const [_, __, runId] = key.split('#');
	return runId;
}

export const toRepositoryKey = (key: WorkflowKey): SatelliteDid.RepositoryKey => {
	const [_, repo] = key.split('#');
	const [owner, name] = repo.split('/');

	return {
		owner,
		name
	};
};
