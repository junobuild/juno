import type { CustomDomain } from '$declarations/satellite/satellite.did';
import type { PostMessage, PostMessageDataResponseHosting } from '$lib/types/post-message';

export type HostingCallback = (data: PostMessageDataResponseHosting) => void;

export const initHostingWorker = async () => {
	const HostingWorker = await import('$lib/workers/workers?worker');
	const hostingWorker: Worker = new HostingWorker.default();

	let hostingCallback: HostingCallback | undefined;

	hostingWorker.onmessage = ({
		data
	}: MessageEvent<PostMessage<PostMessageDataResponseHosting>>) => {
		const { msg } = data;

		switch (msg) {
			case 'customDomainRegistrationState':
				hostingCallback?.(data.data as PostMessageDataResponseHosting);
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
