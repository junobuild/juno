import { SYNC_CUSTOM_DOMAIN_TIMER_INTERVAL } from '$lib/constants/app.constants';
import { getCustomDomainRegistration } from '$lib/rest/bn.v1.rest';
import type { CustomDomain, CustomDomainName, CustomDomainState } from '$lib/types/custom-domain';
import type { PostMessageDataRequest, PostMessageRequest } from '$lib/types/post-message';
import { isNullish, nonNullish } from '@dfinity/utils';

export const onHostingMessage = async ({ data: dataMsg }: MessageEvent<PostMessageRequest>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'stopCustomDomainRegistrationTimer':
			stopTimer();
			return;
		case 'startCustomDomainRegistrationTimer':
			await startTimer({ data });
	}
};

let timer: NodeJS.Timeout | undefined = undefined;

const stopTimer = () => {
	if (!timer) {
		return;
	}

	clearTimeout(timer);
	timer = undefined;
};

// Recursive setTimeout (not setInterval) so the registration sync cannot
// overlap itself. See #2522 / oisy-wallet#9706.
const scheduleNext = ({ customDomain }: { customDomain: CustomDomain }): void => {
	timer = setTimeout(async () => {
		await syncCustomDomainRegistration({ customDomain });

		if (nonNullish(timer)) {
			scheduleNext({ customDomain });
		}
	}, SYNC_CUSTOM_DOMAIN_TIMER_INTERVAL);
};

const startTimer = async ({ data: { customDomain } }: { data: PostMessageDataRequest }) => {
	if (nonNullish(timer)) {
		return;
	}

	if (isNullish(customDomain)) {
		// No custom domain registration to sync
		return;
	}

	// We sync the cycles now but also schedule the update afterwards
	await syncCustomDomainRegistration({ customDomain });

	scheduleNext({ customDomain });
};

const syncCustomDomainRegistration = async ({ customDomain }: { customDomain: CustomDomain }) => {
	try {
		const sync = async (): Promise<CustomDomainState> => {
			const [domainName] = customDomain;
			return await syncCustomDomainRegistrationV1({ domain: domainName });
		};

		const registrationState = await sync();

		emit(registrationState);

		// We sync until Available or Failed
		if (registrationState === null || ['Available', 'Failed'].includes(registrationState)) {
			stopTimer();
		}
	} catch (err: unknown) {
		console.error(err);
		emit('failed');

		// We sync until Available or Failed
		stopTimer();
	}
};

const syncCustomDomainRegistrationV1 = async ({
	domain
}: {
	domain: CustomDomainName;
}): Promise<CustomDomainState> => {
	const response = await getCustomDomainRegistration({ domainName: domain });

	if (response?.status === 'success') {
		const {
			data: { registration_status }
		} = response;
		return registration_status;
	}

	return 'failed';
};

// Update ui with registration state
const emit = (registrationState: CustomDomainState | null) =>
	postMessage({
		msg: 'customDomainRegistrationState',
		data: {
			registrationState
		}
	});
