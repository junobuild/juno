import { setControllers as setOrbiterControllers } from '$lib/api/orbiter.api';
import {
	type SetControllersFn,
	setControllerWithIcMgmt,
	type SetControllerWithIcMgmtResult
} from '$lib/services/_controllers.services';
import type { SetControllerParams } from '$lib/types/controllers';
import type { OrbiterId } from '$lib/types/orbiter';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

export const setOrbitersController = async ({
	orbiterIds,
	controllerId,
	identity,
	...rest
}: {
	orbiterIds: Principal[];
	identity: Identity;
} & SetControllerParams) => {
	const setOrbiterControllerWithIcMgmt = async (
		orbiterId: OrbiterId
	): Promise<SetControllerWithIcMgmtResult> => {
		const setControllersFn: SetControllersFn = async ({ args }) => {
			await setOrbiterControllers({
				args,
				orbiterId,
				identity
			});
		};

		return await setControllerWithIcMgmt({
			setControllersFn,
			...rest,
			canisterId: orbiterId,
			controllerId,
			identity
		});
	};

	await Promise.all(orbiterIds.map(setOrbiterControllerWithIcMgmt));
};
