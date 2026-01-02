import { setControllers as setOrbiterControllers } from '$lib/api/orbiter.api';
import {
	setAdminAccessKey,
	type AdminAccessKeyResult,
	type SetAccessKeysFn
} from '$lib/services/access-keys/key.admin.services';
import type {
	AddAccessKeyParams,
	AddAccessKeyScope,
	AddAdminAccessKeyParams
} from '$lib/types/access-keys';
import type { OrbiterId } from '$lib/types/orbiter';
import { toSetController } from '$lib/utils/controllers.utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';

export const addOrbiterAccessKey = async ({
	identity,
	orbiterIds,
	accessKeyId,
	scope,
	profile
}: {
	orbiterIds: OrbiterId[];
	identity: Identity;
} & AddAccessKeyParams) => {
	if (scope === 'admin') {
		await addOrbitersAdminAccessKey({
			identity,
			orbiterIds,
			accessKeyId,
			profile
		});
		return;
	}

	await setOrbitersNonAdminAccessKey({
		identity,
		orbiterIds,
		accessKeyId,
		profile,
		scope
	});
};

export const addOrbitersAdminAccessKey = async ({
	orbiterIds,
	accessKeyId,
	identity,
	...rest
}: {
	orbiterIds: OrbiterId[];
	identity: Identity;
} & AddAdminAccessKeyParams) => {
	const setOrbiterAdminAccessKeyWithIcMgmt = async (
		orbiterId: OrbiterId
	): Promise<AdminAccessKeyResult> => {
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

const setOrbitersNonAdminAccessKey = async ({
	orbiterIds,
	accessKeyId,
	identity,
	profile,
	scope
}: {
	orbiterIds: OrbiterId[];
	identity: Identity;
	scope: Omit<AddAccessKeyScope, 'admin'>;
} & AddAdminAccessKeyParams) => {
	const setOrbiterAccessKey = async (orbiterId: OrbiterId): Promise<void> => {
		await setOrbiterControllers({
			args: {
				controller: toSetController({
					profile,
					scope: scope as AddAccessKeyScope // Safe case, the param is explicit to avoid passing admin to the function
				}),
				controllers: [Principal.from(accessKeyId)]
			},
			orbiterId,
			identity
		});
	};

	await Promise.all(orbiterIds.map(setOrbiterAccessKey));
};
