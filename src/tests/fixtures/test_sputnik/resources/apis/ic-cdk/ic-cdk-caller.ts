/* eslint-disable require-await, no-console */

import { Principal } from '@icp-sdk/core/principal';
import { defineUpdate } from '@junobuild/functions';
import { caller } from '@junobuild/functions/ic-cdk';

export const checkCaller = defineUpdate({
	handler: () => {
		console.log('Caller ID:', caller().toText());

		console.log('Caller ID is principal:', caller() instanceof Principal);

		console.log('Caller ID is anonymous:', caller().isAnonymous());
	}
});

/* eslint-enable */
