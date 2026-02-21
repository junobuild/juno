import {
	listDocs,
	type ListDocsParams,
	type ListDocsResult
} from '$lib/services/satellite/_list-docs.services';
import type { OptionIdentity } from '$lib/types/itentity';
import type { SatelliteId } from '$lib/types/satellite';
import type { Workflow, WorkflowData, WorkflowKey } from '$lib/types/workflow';
import { toKeyWorkflow } from '$lib/utils/workflow.utils';
import { Principal } from '@icp-sdk/core/principal';

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

export const loadLastWorkflow = async ({
	satelliteId,
	identity
}: {
	satelliteId: SatelliteId;
	identity: OptionIdentity;
}): Promise<[WorkflowKey, Workflow] | null> => {
	/**
	 *
	 * const { items } = await listDocs({
	 * 		satelliteId,
	 * 		identity,
	 * 		collection: '#automation-workflow',
	 * 		order: { desc: true, field: 'keys' },
	 * 		filter: {},
	 * 		limit: 1n
	 * 	});
	 *
	 * 	if (items.length === 0) {
	 * 		return null;
	 * 	}
	 *
	 * 	const [item] = items;
	 * 	return await toKeyWorkflow(item);
	 *
	 */

	const mockWorkflowData: WorkflowData = {
		runNumber: '42',
		runAttempt: '1',
		ref: 'refs/heads/main',
		sha: 'abc123def456',
		actor: 'david',
		workflow: 'deploy.yml',
		eventName: 'push'
	};

	const mockWorkflow: Workflow = {
		owner: Principal.fromText('aaaaa-aa'),
		created_at: 1_700_000_000_000_000_000n,
		updated_at: 1_700_000_001_000_000_000n,
		description: [],
		version: [1n],
		data: mockWorkflowData
	};

	return ['GitHub#david/my-repo#run-42', mockWorkflow];
};
