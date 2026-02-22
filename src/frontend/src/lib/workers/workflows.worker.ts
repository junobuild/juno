import {
	queryAndUpdate,
	type QueryAndUpdateOnCertifiedError,
	type QueryAndUpdateOnResponse,
	type QueryAndUpdateRequestParams
} from '$lib/api/call/query.api';
import { SYNC_WORKFLOWS_TIMER_INTERVAL } from '$lib/constants/app.constants';
import type {
	PostMessageDataRequest,
	PostMessageDataResponseError,
	PostMessageDataResponseWorkflows,
	PostMessageRequest
} from '$lib/types/post-message';
import type { SatelliteId } from '$lib/types/satellite';
import { loadIdentity } from '$lib/utils/worker.utils';
import {
	requestWorkflows,
	type RequestWorkflowsResponse
} from '$lib/workers/_services/workflows-worker.services';
import { type WorkflowsIdbKey, WorkflowsStore } from '$lib/workers/_stores/workflows-worker.store';
import { isEmptyString, isNullish, jsonReplacer } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';

export const onWorkflowsMessage = async ({ data: dataMsg }: MessageEvent<PostMessageRequest>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'stopWorkflowsTimer':
			stopTimer();
			return;
		case 'startWorkflowsTimer':
			await startTimer({ data });
			return;
		case 'restartWorkflowsTimer':
			stopTimer();
			await startTimer({ data });
	}
};

let timer: NodeJS.Timeout | undefined = undefined;

const stopTimer = () => {
	if (!timer) {
		return;
	}

	clearInterval(timer);
	timer = undefined;
};

const startTimer = async ({ data: { satelliteId } }: { data: PostMessageDataRequest }) => {
	if (isEmptyString(satelliteId)) {
		// No satelliteId provided
		return;
	}

	const identity = await loadIdentity();

	if (isNullish(identity)) {
		// We do nothing if no identity
		return;
	}

	await startTimerForSatellite({
		identity,
		satelliteId: Principal.fromText(satelliteId)
	});
};

const startTimerForSatellite = async ({
	satelliteId,
	identity
}: {
	identity: Identity;
	satelliteId: SatelliteId;
}) => {
	const store = await WorkflowsStore.init({
		satelliteId
	});

	emitSavedWorkflows({ store });

	const sync = async () => await syncWorkflows({ identity, store });

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_WORKFLOWS_TIMER_INTERVAL);
};

const syncing: Record<WorkflowsIdbKey, boolean> = {};

let initialized = false;

const syncWorkflows = async ({
	identity,
	store
}: {
	identity: Identity;
	store: WorkflowsStore;
}) => {
	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing[store.idbKey] === true) {
		return;
	}

	syncing[store.idbKey] = true;

	const request = ({
		identity: _,
		certified
	}: QueryAndUpdateRequestParams): Promise<RequestWorkflowsResponse> =>
		requestWorkflows({
			identity,
			certified,
			store
		});

	const onLoad: QueryAndUpdateOnResponse<RequestWorkflowsResponse> = ({ certified, ...rest }) => {
		syncWorkflowsData({ certified, store, ...rest });
	};

	const onCertifiedError: QueryAndUpdateOnCertifiedError = ({ error }) => {
		store.reset();

		postMessageWorkflowsError(error);

		stopTimer();
	};

	await queryAndUpdate<RequestWorkflowsResponse>({
		request,
		onLoad,
		onCertifiedError,
		identity,
		resolution: 'all_settled',
		// For now, we only use query. We can of course use a query+update approach but in a first iteration we rather like to spare the inherited load
		// given that the information is purely informational
		strategy: 'query'
	});

	await store.save();

	syncing[store.idbKey] = false;
};

const postMessageWorkflows = ({
	certified,
	satelliteId,
	workflows: newWorkflows
}: RequestWorkflowsResponse & {
	satelliteId: SatelliteId;
	certified: boolean;
}) => {
	const certifiedWorkflows = newWorkflows.map((data) => ({ data, certified }));

	const data: PostMessageDataResponseWorkflows = {
		workflows: {
			satelliteId: satelliteId.toText(),
			newWorkflows: JSON.stringify(certifiedWorkflows, jsonReplacer)
		}
	};

	postMessage({
		msg: 'syncWorkflows',
		data
	});
};

const syncWorkflowsData = ({
	response: { workflows: fetchedWorkflows },
	certified,
	store
}: {
	response: RequestWorkflowsResponse;
	certified: boolean;
	store: WorkflowsStore;
}) => {
	// Is there any new workflows unknown so far or which has become certified
	const newWorkflows = fetchedWorkflows.filter(
		([key]) => isNullish(store.workflows[`${key}`]) || !store.workflows[`${key}`].certified
	);

	if (newWorkflows.length === 0) {
		// We execute postMessage at least once because developer may have no workflows at all
		if (!initialized) {
			postMessageWorkflows({
				satelliteId: store.satelliteId,
				workflows: [],
				certified
			});

			initialized = true;
		}

		return;
	}

	store.update({ newWorkflows, certified });

	postMessageWorkflows({
		satelliteId: store.satelliteId,
		workflows: newWorkflows,
		certified
	});

	// If we have sent at least one postMessage we can consider the worker has being initialized.
	initialized = true;
};

const postMessageWorkflowsError = (error: unknown) => {
	const data: PostMessageDataResponseError = {
		error
	};

	postMessage({
		msg: 'syncWorkflowsError',
		data
	});
};

const emitSavedWorkflows = ({ store }: { store: WorkflowsStore }) => {
	const uiWorkflows = Object.values(store.workflows).sort(({ data: [keyA] }, { data: [keyB] }) =>
		keyB.localeCompare(keyA)
	);

	const data: PostMessageDataResponseWorkflows = {
		workflows: {
			satelliteId: store.satelliteId.toText(),
			newWorkflows: JSON.stringify(uiWorkflows, jsonReplacer)
		}
	};

	postMessage({
		msg: 'syncWorkflows',
		data
	});
};
