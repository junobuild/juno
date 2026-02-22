import type { QueryAndUpdateRequestParams } from '$lib/api/call/query.api';
import { listWorkflows } from '$lib/services/satellite/automation/workflows.services';
import type { WorkflowKeyValue } from '$lib/types/workflow';
import type { WorkflowsStore } from '$lib/workers/_stores/workflows-worker.store';

type RequestWorkerWorkflowsParams = QueryAndUpdateRequestParams & { store: WorkflowsStore };

export interface RequestWorkflowsResponse {
	workflows: WorkflowKeyValue[];
}

export const requestWorkflows = async ({
	store,
	identity
}: RequestWorkerWorkflowsParams): Promise<RequestWorkflowsResponse> => {
	// We query tip to discover the new transactions
	const start = undefined;

	const { items } = await listWorkflows({
		identity,
		satelliteId: store.satelliteId,
		order: { desc: true, field: 'keys' },
		filter: {},
		startAfter: start
		// TODO: certified from param the day we want to use update calls as well
	});

	return {
		workflows: items as WorkflowKeyValue[]
	};
};
