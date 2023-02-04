import { idleSignOut } from '$lib/services/auth.services';
import type { AuthStoreData } from '$lib/stores/auth.store';
import type { PostMessage, PostMessageDataResponse } from '$lib/types/post-message';

export const initAuthWorker = async () => {
	const AuthWorker = await import('$lib/workers/auth.worker?worker');
	const authWorker: Worker = new AuthWorker.default();

	authWorker.onmessage = async ({ data }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
		const { msg } = data;

		switch (msg) {
			case 'signOutIdleTimer':
				await idleSignOut();
				return;
		}
	};

	return {
		syncAuthIdle: (auth: AuthStoreData) => {
			if (!auth.identity) {
				authWorker.postMessage({ msg: 'stopIdleTimer' });
				return;
			}

			authWorker.postMessage({
				msg: 'startIdleTimer'
			});
		}
	};
};
