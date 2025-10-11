import type { SatelliteDid } from '$declarations';
import { AppWorker } from '$lib/services/workers/_worker.services';
import type { PostMessageDataResponseHosting, PostMessages } from '$lib/types/post-message';

export type HostingCallback = (data: PostMessageDataResponseHosting) => void;

export class HostingWorker extends AppWorker {
	#hostingCallback: HostingCallback | undefined;

	constructor(worker: Worker) {
		super(worker);

		worker.onmessage = ({ data }: MessageEvent<PostMessages>) => {
			const { msg } = data;

			switch (msg) {
				case 'customDomainRegistrationState':
					this.#hostingCallback?.(data.data as PostMessageDataResponseHosting);
					return;
			}
		};
	}

	static async init(): Promise<HostingWorker> {
		const worker = await AppWorker.getInstance();
		return new HostingWorker(worker);
	}

	startCustomDomainRegistrationTimer = ({
		callback,
		customDomain
	}: {
		customDomain: SatelliteDid.CustomDomain;
		callback: HostingCallback;
	}) => {
		this.#hostingCallback = callback;

		this._worker.postMessage({
			msg: 'startCustomDomainRegistrationTimer',
			data: { customDomain }
		});
	};

	stopCustomDomainRegistrationTimer = () => {
		this._worker.postMessage({
			msg: 'stopCustomDomainRegistrationTimer'
		});
	};
}
