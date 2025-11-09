import { idleSignOut } from '$lib/services/auth/auth.services';
import { AppWorker } from '$lib/services/workers/_worker.services';
import { authRemainingTimeStore, type AuthStoreData } from '$lib/stores/auth.store';
import type { PostMessageDataResponseAuth, PostMessages } from '$lib/types/post-message';
import { isNullish } from '@dfinity/utils';

export class AuthWorker extends AppWorker {
	constructor(worker: Worker) {
		super(worker);

		worker.onmessage = async ({ data }: MessageEvent<PostMessages>) => {
			const { msg } = data;

			switch (msg) {
				case 'signOutIdleTimer':
					await idleSignOut();
					return;
				case 'delegationRemainingTime':
					authRemainingTimeStore.set((data.data as PostMessageDataResponseAuth)?.authRemainingTime);
					return;
			}
		};
	}

	static async init(): Promise<AuthWorker> {
		const worker = await AppWorker.getInstance();
		return new AuthWorker(worker);
	}

	syncAuthIdle = (auth: AuthStoreData) => {
		if (isNullish(auth.identity)) {
			this._worker.postMessage({ msg: 'stopIdleTimer' });
			return;
		}

		this._worker.postMessage({
			msg: 'startIdleTimer'
		});
	};
}
