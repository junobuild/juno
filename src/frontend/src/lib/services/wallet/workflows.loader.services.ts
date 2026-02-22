import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { workflowsCertifiedStore } from '$lib/stores/workflows/workflows.store';
import type { PostMessageDataResponseWorkflows } from '$lib/types/post-message';
import { isNullish, jsonReviver } from '@dfinity/utils';
import { get } from 'svelte/store';

export const onSyncWorkflows = (data: PostMessageDataResponseWorkflows) => {
	if (isNullish(data.workflows)) {
		return;
	}

	const {
		workflows: { satelliteId, newWorkflows }
	} = data;

	const workflows = JSON.parse(newWorkflows, jsonReviver);

	workflowsCertifiedStore.prepend({
		satelliteId,
		workflows
	});
};

export const onWorkflowsError = ({ error: err }: { error: unknown }) => {
	workflowsCertifiedStore.reset();

	toasts.error({
		text: get(i18n).errors.workflows_loading,
		detail: err
	});
};
