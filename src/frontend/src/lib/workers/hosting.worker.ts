import type { SatelliteDid } from '$declarations';
import { SYNC_CUSTOM_DOMAIN_TIMER_INTERVAL } from '$lib/constants/app.constants';
import { getCustomDomainRegistrationV0 } from '$lib/rest/bn.v0.rest';
import { getCustomDomainRegistration } from '$lib/rest/bn.v1.rest';
import type { CustomDomain, CustomDomainName, CustomDomainState } from '$lib/types/custom-domain';
import type { PostMessageDataRequest, PostMessageRequest } from '$lib/types/post-message';
import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';

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

	clearInterval(timer);
	timer = undefined;
};

const startTimer = async ({ data: { customDomain } }: { data: PostMessageDataRequest }) => {
	if (isNullish(customDomain)) {
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
		const sync = async (): Promise<CustomDomainState> => {
			const [domainName, custom] = customDomain;

			if (nonNullish(fromNullable(custom.bn_id))) {
				return await syncCustomDomainRegistrationV0({ customDomain: custom });
			}

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

	syncing = false;
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

const syncCustomDomainRegistrationV0 = async ({
	customDomain
}: {
	customDomain: SatelliteDid.CustomDomain;
}): Promise<CustomDomainState> => {
	const registration = await getCustomDomainRegistrationV0(customDomain);
	const registrationState = nonNullish(registration)
		? typeof registration.state !== 'string' && 'Failed' in registration.state
			? 'Failed'
			: registration.state
		: null;

	switch (registrationState) {
		case 'PendingOrder':
		case 'PendingChallengeResponse':
		case 'PendingAcmeApproval':
			return 'registering';
		case 'Available':
			return 'registered';
		default:
			return 'failed';
	}
};

// Update ui with registration state
const emit = (registrationState: CustomDomainState | null) =>
	postMessage({
		msg: 'customDomainRegistrationState',
		data: {
			registrationState
		}
	});
