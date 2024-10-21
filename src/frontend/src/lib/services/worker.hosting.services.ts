import type { CustomDomain } from '$declarations/satellite/satellite.did';
import type { PostMessage, PostMessageDataResponse } from '$lib/types/post-message';

export type HostingCallback = (data: PostMessageDataResponse) => void;

export const initHostingWorker = async () => {
	const HostingWorker = await import('$lib/workers/hosting.worker?worker');
	const hostingWorker: Worker = new HostingWorker.default();

	let hostingCallback: HostingCallback | undefined;

	hostingWorker.onmessage = ({ data }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
		const { msg } = data;

		switch (msg) {
			case 'customDomainRegistrationState':
				hostingCallback?.(data.data);
				return;
		}
	};

	return {
		startCustomDomainRegistrationTimer: ({
			callback,
			customDomain
		}: {
			customDomain: CustomDomain;
			callback: HostingCallback;
		}) => {
			hostingCallback = callback;

			hostingWorker.postMessage({
				msg: 'startCustomDomainRegistrationTimer',
				data: { customDomain }
			});
		},
		stopCustomDomainRegistrationTimer: () => {
			hostingWorker.postMessage({
				msg: 'stopCustomDomainRegistrationTimer'
			});
		}
	};
};
