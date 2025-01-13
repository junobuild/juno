import { idleSignOut } from '$lib/services/auth.services';
import { authRemainingTimeStore, type AuthStoreData } from '$lib/stores/auth.store';
import type { PostMessageResponse } from '$lib/types/post-message';

export const initAuthWorker = async () => {
	const AuthWorker = await import('$lib/workers/workers?worker');
	const authWorker: Worker = new AuthWorker.default();

	authWorker.onmessage = async ({ data }: MessageEvent<PostMessageResponse>) => {
		const { msg, data: value } = data;

		switch (msg) {
			case 'signOutIdleTimer':
				await idleSignOut();
				return;
			case 'delegationRemainingTime':
				authRemainingTimeStore.set(value?.authRemainingTime);
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
