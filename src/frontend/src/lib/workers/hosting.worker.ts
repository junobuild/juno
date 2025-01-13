import type { CustomDomain } from '$declarations/satellite/satellite.did';
import { SYNC_CUSTOM_DOMAIN_TIMER_INTERVAL } from '$lib/constants/constants';
import { getCustomDomainRegistration } from '$lib/rest/bn.rest';
import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
import type { PostMessageDataRequest, PostMessageRequest } from '$lib/types/post-message';
import { fromNullable, nonNullish } from '@dfinity/utils';

export const onHostingMessage = async ({ data: dataMsg }: MessageEvent<PostMessageRequest>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'stopCustomDomainRegistrationTimer':
			stopTimer();
			return;
		case 'startCustomDomainRegistrationTimer':
			await startTimer({ data });
			return;
	}
};

let timer: NodeJS.Timeout | undefined = undefined;

const stopTimer = () => {
	if (!timer) {
		return;
	}

	clearInterval(timer);
	timer = undefined;
};

const startTimer = async ({ data: { customDomain } }: { data: PostMessageDataRequest }) => {
	if (customDomain === undefined || fromNullable(customDomain.bn_id) === undefined) {
		// No custom domain registration to sync
		return;
	}

	const sync = async () => await syncCustomDomainRegistration({ customDomain });

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_CUSTOM_DOMAIN_TIMER_INTERVAL);
};

let syncing = false;

const syncCustomDomainRegistration = async ({ customDomain }: { customDomain: CustomDomain }) => {
	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing) {
		return;
	}

	syncing = true;

	try {
		const registration = await getCustomDomainRegistration(customDomain);
		const registrationState = nonNullish(registration)
			? typeof registration.state !== 'string' && 'Failed' in registration.state
				? 'Failed'
				: registration.state
			: null;

		emit(registrationState);

		// We sync until Available or Failed
		if (registrationState === null || ['Available', 'Failed'].includes(registrationState)) {
			stopTimer();
		}
	} catch (err: unknown) {
		console.error(err);
		emit('Failed');

		// We sync until Available or Failed
		stopTimer();
	}

	syncing = false;
};

// Update ui with registration state
const emit = (registrationState: CustomDomainRegistrationState | null) =>
	postMessage({
		msg: 'customDomainRegistrationState',
		data: {
			registrationState
		}
	});
