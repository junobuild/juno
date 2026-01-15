import { setOrbiter, setSatellite } from '$lib/api/mission-control.api';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

interface AttachWithMissionControlParams {
	missionControlId: MissionControlId;
	canisterId: Principal;
	identity: OptionIdentity;
}

export const attachWithMissionControl = async ({
	segment,
	segmentId,
	...rest
}: {
	missionControlId: MissionControlId;
	identity: Identity;
	segment: 'satellite' | 'orbiter';
	segmentId: Principal;
}) => {
	const attachOrbiter = async ({ canisterId, ...rest }: AttachWithMissionControlParams) => {
		await setOrbiter({ ...rest, orbiterId: canisterId });
	};

	const attachSatellite = async ({
		canisterId,
		missionControlId,
		identity
	}: AttachWithMissionControlParams) => {
		await setSatellite({ missionControlId, satelliteId: canisterId, identity });
	};

	const fn = segment === 'orbiter' ? attachOrbiter : attachSatellite;

	await fn({
		...rest,
		canisterId: segmentId
	});
};
