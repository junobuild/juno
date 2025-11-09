/* eslint-disable require-await, no-console */

import type { OnSetDocContext } from '@junobuild/functions';
import { time } from '@junobuild/functions/ic-cdk';

export const testIcCdkTime = async (context: OnSetDocContext) => {
	console.log(`${context.data.key}:`, time());
};

/* eslint-enable */
