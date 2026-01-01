import { setControllers as setOrbiterControllers } from '$lib/api/orbiter.api';
import {
	type SetAccessKeysFn,
	setAdminAccessKey,
	type SetAdminAccessKeyResult
} from '$lib/services/access-keys/key.admin.services';
import type { SetAccessKeyParams } from '$lib/types/controllers';
import type { OrbiterId } from '$lib/types/orbiter';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

export const setOrbiterAdminAccessKey = async ({
	orbiterIds,
	accessKeyId,
	identity,
	...rest
}: {
	orbiterIds: Principal[];
	identity: Identity;
} & SetAccessKeyParams) => {
	const setOrbiterAdminAccessKeyWithIcMgmt = async (
		orbiterId: OrbiterId
	): Promise<SetAdminAccessKeyResult> => {
		const setAccessKeysFn: SetAccessKeysFn = async ({ args }) => {
			await setOrbiterControllers({
				args,
				orbiterId,
				identity
			});
		};

		return await setAdminAccessKey({
			setAccessKeysFn,
			...rest,
			canisterId: orbiterId,
			accessKeyId,
			identity
		});
	};

	await Promise.all(orbiterIds.map(setOrbiterAdminAccessKeyWithIcMgmt));
};
