import { setControllers as setOrbiterControllers } from '$lib/api/orbiter.api';
import {
	type SetAccessKeysFn,
	setAdminAccessKey,
	type SetAdminAccessKeyResult
} from '$lib/services/access-keys/key.admin.services';
import type {
	SetAccessKeyParams,
	SetAccessKeyScope,
	SetAdminAccessKeyParams
} from '$lib/types/controllers';
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
} & SetAccessKeyParams) => {
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
} & SetAdminAccessKeyParams) => {
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

const setOrbitersNonAdminAccessKey = async ({
	orbiterIds,
	accessKeyId,
	identity,
	profile,
	scope
}: {
	orbiterIds: OrbiterId[];
	identity: Identity;
	scope: Omit<SetAccessKeyScope, 'admin'>;
} & SetAdminAccessKeyParams) => {
	const setOrbiterAccessKey = async (orbiterId: OrbiterId): Promise<void> => {
		await setOrbiterControllers({
			args: {
				controller: toSetController({
					profile,
					scope: scope as SetAccessKeyScope // Safe case, the param is explicit to avoid passing admin to the function
				}),
				controllers: [Principal.from(accessKeyId)]
			},
			orbiterId,
			identity
		});
	};

	await Promise.all(orbiterIds.map(setOrbiterAccessKey));
};
