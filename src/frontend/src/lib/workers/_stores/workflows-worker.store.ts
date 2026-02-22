import { workflowsIdbStore } from '$lib/stores/app/idb.store';
import type { CertifiedWorkflowKeyValue, WorkflowKey, WorkflowKeyValue } from '$lib/types/workflow';

import type { SatelliteId } from '$lib/types/satellite';
import { get, set } from 'idb-keyval';

export type IndexedWorkflows = Record<WorkflowKey, CertifiedWorkflowKeyValue>;

// Not reactive, only used to hold values imperatively.
interface WorkflowsState {
	workflows: IndexedWorkflows;
}

export type WorkflowsIdbKey = string;

export class WorkflowsStore {
	private static EMPTY_STORE: WorkflowsState = {
		workflows: {}
	};

	#store: WorkflowsState;
	#idbKey: WorkflowsIdbKey;
	#satelliteId: SatelliteId;

	private constructor({
		state,
		idbKey: key,
		satelliteId
	}: {
		state: WorkflowsState | undefined;
		idbKey: WorkflowsIdbKey;
		satelliteId: SatelliteId;
	}) {
		this.#store = state ?? WorkflowsStore.EMPTY_STORE;
		this.#idbKey = key;
		this.#satelliteId = satelliteId;
	}

	get satelliteId(): SatelliteId {
		return this.#satelliteId;
	}

	get workflows(): IndexedWorkflows {
		return this.#store.workflows;
	}

	get idbKey(): WorkflowsIdbKey {
		return this.#idbKey;
	}

	update({
		newWorkflows,
		certified
	}: {
		newWorkflows: WorkflowKeyValue[];
		certified: boolean;
	}): void {
		this.#store = {
			workflows: {
				...this.#store.workflows,
				...newWorkflows.reduce<Record<WorkflowKey, CertifiedWorkflowKeyValue>>(
					(acc, [key, value]) => ({
						...acc,
						[`${key}`]: {
							data: [key, value],
							certified
						}
					}),
					{}
				)
			}
		};
	}

	clean(certifiedWorkflows: IndexedWorkflows) {
		this.#store = {
			...this.#store,
			workflows: {
				...certifiedWorkflows
			}
		};
	}

	reset() {
		this.#store = WorkflowsStore.EMPTY_STORE;
	}

	async save(): Promise<void> {
		// Save information to improve UX when application is reloaded or returning users.
		await set(this.#idbKey, this.#store, workflowsIdbStore);
	}

	static async init({ satelliteId }: { satelliteId: SatelliteId }): Promise<WorkflowsStore> {
		const idbKey = satelliteId.toText();
		const state = await get(idbKey, workflowsIdbStore);
		return new WorkflowsStore({ state, idbKey, satelliteId });
	}
}
