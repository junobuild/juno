import { idleSignOut } from '$lib/services/auth/auth.services';
import { authRemainingTimeStore, type AuthStoreData } from '$lib/stores/auth.store';
import type { PostMessage, PostMessageDataResponseAuth } from '$lib/types/post-message';

export const initAuthWorker = async () => {
	const AuthWorker = await import('$lib/workers/workers?worker');
	const authWorker: Worker = new AuthWorker.default();

	authWorker.onmessage = async ({
		data
	}: MessageEvent<PostMessage<PostMessageDataResponseAuth>>) => {
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
