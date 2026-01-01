import { SATELLITE_v0_0_7 } from '$lib/constants/version.constants';
import { container } from '$lib/utils/juno.utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { satelliteVersion } from '@junobuild/admin';
import { compare } from 'semver';

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
