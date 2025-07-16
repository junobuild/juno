import {
	syncCanistersSyncData,
	syncCanisterSyncData
} from '$lib/services/canisters.loader.services';
import type { CanisterSegment } from '$lib/types/canister';
import type {
	PostMessageDataResponseCanistersSyncData,
	PostMessageDataResponseCanisterSyncData,
	PostMessages
} from '$lib/types/post-message';

export interface RegistryWorker {
	loadRegistry: (params: { segments: CanisterSegment[] }) => void;
}

export const initRegistryWorker = async (): Promise<RegistryWorker> => {
	const RegistryWorker = await import('$lib/workers/workers?worker');
	const registryWorker: Worker = new RegistryWorker.default();

	registryWorker.onmessage = ({ data }: MessageEvent<PostMessages>) => {
		const { msg } = data;

		// TODO

		switch (msg) {
			case 'syncCanister':
				syncCanisterSyncData(data.data as PostMessageDataResponseCanisterSyncData);
				return;
			case 'syncCanisters':
				syncCanistersSyncData(data.data as PostMessageDataResponseCanistersSyncData);
				return;
		}
	};

	return {
		loadRegistry: ({ segments }: { segments: CanisterSegment[] }) => {
			registryWorker.postMessage({
				msg: 'loadRegistry',
				data: { segments }
			});
		}
	};
};
