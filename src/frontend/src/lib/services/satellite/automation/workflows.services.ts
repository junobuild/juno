import {
	listDocs,
	type ListDocsParams,
	type ListDocsResult
} from '$lib/services/satellite/_list-docs.services';
import type { Workflow, WorkflowKey } from '$lib/types/workflow';
import { toKeyWorkflow } from '$lib/utils/workflow.utils';

export const listWorkflows = async (params: ListDocsParams): Promise<ListDocsResult<Workflow>> => {
	const { items, matches_length, items_length } = await listDocs({
		...params,
		collection: '#automation-workflow'
	});

	const workflows: [WorkflowKey, Workflow][] = [];

	for (const item of items) {
		const workflow = await toKeyWorkflow(item);
		workflows.push(workflow);
	}

	return {
		items: workflows,
		matches_length,
		items_length
	};
};
