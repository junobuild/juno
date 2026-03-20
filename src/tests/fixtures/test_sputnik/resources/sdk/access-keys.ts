import { Principal } from '@icp-sdk/core/principal';
import type { OnSetDocContext } from '@junobuild/functions';
import {
	getAccessKeys,
	getAdminAccessKeys,
	isAdminController,
	isValidAccessKey,
	isWriteAccessKey
} from '@junobuild/functions/sdk';

/* eslint-disable no-console */

export const testSdkAccessKeys = async ({
	caller
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const callerText = Principal.fromUint8Array(caller).toText();

	console.log(`[${callerText}] caller:`, caller);

	const accessKeys = getAccessKeys();
	const admin = getAdminAccessKeys();

	console.log(`[${callerText}] getAccessKeys:`, accessKeys);
	console.log(`[${callerText}] getAdminAccessKeys:`, admin);

	console.log(
		`[${callerText}] isValidAccessKey:`,
		isValidAccessKey({
			id: caller,
			accessKeys
		})
	);
	console.log(
		`[${callerText}] isWriteAccessKey:`,
		isWriteAccessKey({
			id: caller,
			accessKeys
		})
	);
	console.log(
		`[${callerText}] isAdminController:`,
		isAdminController({
			id: caller,
			accessKeys
		})
	);
};

/* eslint-enable */
