import type { SatelliteDid } from '$declarations';
import type { Workflow, WorkflowKey } from '$lib/types/workflow';
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
