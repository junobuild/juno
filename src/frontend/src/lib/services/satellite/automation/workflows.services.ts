import { listDocs as listDocsApi } from '$lib/api/satellites.api';
import {
	listDocs,
	type ListDocsParams,
	type ListDocsResult
} from '$lib/services/satellite/_list-docs.services';
import type { OptionIdentity } from '$lib/types/itentity';
import type { SatelliteId } from '$lib/types/satellite';
import type { Workflow, WorkflowKey } from '$lib/types/workflow';
import { toKeyWorkflow } from '$lib/utils/workflow.utils';

export const listWorkflows = async (params: ListDocsParams): Promise<ListDocsResult<Workflow>> => {
	const { items, matches_length, items_length } = await listDocs({
		...params,
		// We use listDocs008 for listing users for backwards compatibility but, automation was introduced in v0.2.0
		// and since we use it in a worker, where we want to avoid to check version, we just rely on the latest API
		// for simplicity reasons.
		listFn: listDocsApi,
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

export const listLastWorkflows = async ({
	satelliteId,
	identity
}: {
	satelliteId: SatelliteId;
	identity: OptionIdentity;
}): Promise<[WorkflowKey, Workflow][] | null> => {
	const { items } = await listDocs({
		satelliteId,
		identity,
		collection: '#automation-workflow',
		order: { desc: true, field: 'keys' },
		filter: {},
		limit: 3n,
		listFn: listDocsApi
	});

	if (items.length === 0) {
		return null;
	}

	const workflows: [WorkflowKey, Workflow][] = [];

	for (const item of items) {
		const workflow = await toKeyWorkflow(item);
		workflows.push(workflow);
	}

	return workflows;
};
