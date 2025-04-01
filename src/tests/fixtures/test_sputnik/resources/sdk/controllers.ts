import { Principal } from '@dfinity/principal';
import type { OnSetDocContext } from '@junobuild/functions';
import {
	getAdminControllers,
	getControllers,
	isAdminController,
	isController
} from '@junobuild/functions/sdk';

/* eslint-disable no-console */

export const testSdkControllers = async ({
	caller
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	const callerText = Principal.fromUint8Array(caller).toText();

	console.log(`[${callerText}] caller:`, caller);

	const controllers = getControllers();
	const admin = getAdminControllers();

	console.log(`[${callerText}] getControllers:`, controllers);
	console.log(`[${callerText}] getAdminControllers:`, admin);

	console.log(
		`[${callerText}] isController:`,
		isController({
			caller,
			controllers
		})
	);
	console.log(
		`[${callerText}] isAdminController:`,
		isAdminController({
			caller,
			controllers
		})
	);
};

/* eslint-enable */