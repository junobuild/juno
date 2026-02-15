import { listDocs } from '$lib/services/satellite/_list-docs.services';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ListParams } from '$lib/types/list';
import type { Workflow, WorkflowKey } from '$lib/types/workflow';
import { toKeyWorkflow } from '$lib/utils/workflow.utils';
import type { Principal } from '@icp-sdk/core/principal';

export const listWorkflows = async (
	params: Pick<ListParams, 'startAfter' | 'filter' | 'order'> & {
		satelliteId: Principal;
		identity: OptionIdentity;
	}
): Promise<{
	workflows: [WorkflowKey, Workflow][];
	matches_length: bigint;
	items_length: bigint;
}> => {
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
		workflows,
		matches_length,
		items_length
	};
};
