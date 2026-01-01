import { setControllers as setSatelliteControllers } from '$lib/api/satellites.api';
import { SATELLITE_v0_0_7 } from '$lib/constants/version.constants';
import {
	type SetAccessKeysFn,
	setAdminAccessKey,
	type SetAdminAccessKeyResult
} from '$lib/services/access-keys/key.admin.services';
import type { SetAdminAccessKeyParams } from '$lib/types/controllers';
import type { SatelliteId } from '$lib/types/satellite';
import { container } from '$lib/utils/juno.utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { satelliteVersion } from '@junobuild/admin';
import { compare } from 'semver';

export const setSatellitesAdminAccessKey = async ({
	satelliteIds,
	accessKeyId,
	identity,
	...rest
}: {
	satelliteIds: SatelliteId[];
	identity: Identity;
} & SetAdminAccessKeyParams) => {
	const { setSatelliteIds, addSatellitesIds } = await mapSatellitesForControllersFn({
		satelliteIds,
		identity
	});

	if (addSatellitesIds.length > 0) {
		// TODO: throw exception asking for upgrade super old Satellites so unlikely
	}

	const setSatelliteAdminAccessKey = async (
		satelliteId: SatelliteId
	): Promise<SetAdminAccessKeyResult> => {
		const setAccessKeysFn: SetAccessKeysFn = async ({ args }) => {
			await setSatelliteControllers({
				args,
				satelliteId,
				identity
			});
		};

		return await setAdminAccessKey({
			setAccessKeysFn,
			...rest,
			canisterId: satelliteId,
			accessKeyId,
			identity
		});
	};

	await Promise.all(setSatelliteIds.map(setSatelliteAdminAccessKey));
};

interface SatellitesForControllersFn {
	setSatelliteIds: Principal[];
	addSatellitesIds: Principal[];
}

export const mapSatellitesForControllersFn = async ({
	satelliteIds,
	identity
}: {
	satelliteIds: Principal[];
	identity: Identity;
}): Promise<SatellitesForControllersFn> => {
	const mapVersions = async (
		satelliteId: Principal
	): Promise<{ satelliteId: Principal; version: string }> => {
		let version: string;
		try {
			version = await satelliteVersion({
				satellite: { satelliteId: satelliteId.toText(), identity, ...container() }
			});
		} catch (_err: unknown) {
			// For simplicity, this method assumes compatibility with very old Satellite instances, like instance that would have
			// never been upgraded since the Beta phrase in 2023.
			// We set the version to trigger the use of the latest API, since Satellite versions >= v0.0.24
			// no longer implement the /version endpoint.
			version = SATELLITE_v0_0_7;
		}

		return {
			version,
			satelliteId
		};
	};

	const versions = await Promise.all(satelliteIds.map(mapVersions));

	return versions.reduce<SatellitesForControllersFn>(
		({ setSatelliteIds, addSatellitesIds }, { satelliteId, version }) => {
			if (compare(version, SATELLITE_v0_0_7) >= 0) {
				return {
					setSatelliteIds: [...setSatelliteIds, satelliteId],
					addSatellitesIds
				};
			}

			return {
				setSatelliteIds,
				addSatellitesIds: [...addSatellitesIds, satelliteId]
			};
		},
		{ setSatelliteIds: [], addSatellitesIds: [] }
	);
};
