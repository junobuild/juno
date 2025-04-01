/* eslint-disable require-await, no-console */

import { Principal } from '@dfinity/principal';
import type { OnSetDocContext } from '@junobuild/functions';
import { id } from '@junobuild/functions/ic-cdk';

export const testIcCdkId = async (_context: OnSetDocContext) => {
	console.log('Satellite ID:', id().toText());

	console.log('Satellite ID is principal:', id() instanceof Principal);

	console.log('Satellite ID is anonymous:', id().isAnonymous());
};

/* eslint-enable */
