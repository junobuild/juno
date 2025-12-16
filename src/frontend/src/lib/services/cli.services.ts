import type { MissionControlDid } from '$declarations';
import { setOrbitersController } from '$lib/api/mission-control.api';
import {
	setMissionControlControllerForVersion,
	setSatellitesControllerForVersion
} from '$lib/services/mission-control/mission-control.services';
import type { Option } from '$lib/types/utils';
import { bigintStringify } from '$lib/utils/number.utils';
import { orbiterName } from '$lib/utils/orbiter.utils';
import { satelliteName } from '$lib/utils/satellite.utils';
import { notEmptyString } from '@dfinity/utils';
import type { PrincipalText } from '@dfinity/zod-schemas';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

interface SetCliControllersParams {
	selectedMissionControl: boolean;
	missionControlId: Principal;
	controllerId: PrincipalText;
	profile: Option<string>;
	identity: Identity;
	selectedSatellites: [Principal, MissionControlDid.Satellite][];
	selectedOrbiters: [Principal, MissionControlDid.Orbiter][];
}

export const setCliControllers = async (
	params: SetCliControllersParams
): Promise<
	{ success: 'ok'; redirectQueryParams: string[] } | { success: 'error'; err: unknown }
> => {
	try {
		await setCliControllersWithMissionControl(params);

		return { success: 'ok', redirectQueryParams: buildRedirectParameters(params) };
	} catch (err: unknown) {
		return { success: 'error', err };
	}
};

const setCliControllersWithMissionControl = async ({
	selectedMissionControl,
	missionControlId,
	controllerId,
	profile,
	identity,
	selectedSatellites,
	selectedOrbiters
}: SetCliControllersParams) => {
	await Promise.all([
		...(selectedMissionControl
			? [
					setMissionControlControllerForVersion({
						missionControlId,
						controllerId,
						profile,
						scope: 'admin',
						identity
					})
				]
			: []),
		...(selectedSatellites.length > 0
			? [
					setSatellitesControllerForVersion({
						missionControlId,
						controllerId,
						satelliteIds: selectedSatellites.map((s) => s[0]),
						profile,
						scope: 'admin',
						identity
					})
				]
			: []),
		...(selectedOrbiters.length > 0
			? [
					setOrbitersController({
						missionControlId,
						controllerId,
						orbiterIds: selectedOrbiters.map((s) => s[0]),
						profile,
						scope: 'admin',
						identity
					})
				]
			: [])
	]);
};

const buildRedirectParameters = ({
	selectedSatellites,
	selectedOrbiters,
	selectedMissionControl,
	profile,
	missionControlId
}: Pick<
	SetCliControllersParams,
	| 'selectedSatellites'
	| 'selectedOrbiters'
	| 'selectedMissionControl'
	| 'profile'
	| 'missionControlId'
>): string[] =>
	[
		selectedSatellites.length > 0
			? `satellites=${encodeURIComponent(
					JSON.stringify(
						selectedSatellites.map(([p, n]) => ({
							p: p.toText(),
							n: satelliteName(n)
						})),
						bigintStringify
					)
				)}`
			: undefined,
		selectedOrbiters.length > 0
			? `orbiters=${encodeURIComponent(
					JSON.stringify(
						selectedOrbiters.map(([p, n]) => ({
							p: p.toText(),
							n: orbiterName(n)
						})),
						bigintStringify
					)
				)}`
			: undefined,
		selectedMissionControl ? `mission_control=${missionControlId.toText()}` : undefined,
		profile !== '' ? `profile=${profile}` : undefined
	].filter((param) => notEmptyString(param));
