import type { OnSetDocContext } from '@junobuild/functions';
import {
	getAdminControllers,
	getControllers,
	isAdminController,
	isController
} from '@junobuild/functions/sdk';

export const testSdkControllers = async ({
	caller
	// eslint-disable-next-line require-await
}: OnSetDocContext) => {
	console.log('caller:', caller);

	const controllers = getControllers();
	const admin = getAdminControllers();

	console.log('getControllers:', controllers);
	console.log('getAdminControllers:', admin);

	console.log(
		'isController:',
		isController({
			caller,
			controllers
		})
	);
	console.log(
		'isAdminController:',
		isAdminController({
			caller,
			controllers
		})
	);
};
