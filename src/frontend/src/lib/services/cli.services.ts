import type { MissionControlDid } from '$declarations';
import { setOrbitersController as setOrbitersControllerWithMctrl } from '$lib/api/mission-control.api';
import { setOrbiterAdminAccessKey } from '$lib/services/access-keys/orbiter.key.admin.services';
import { setSatellitesAdminAccessKey } from '$lib/services/access-keys/satellites.key.admin.services';
import {
	setMissionControlControllerForVersion,
	setSatellitesControllerForVersion as setSatellitesControllerForVersionWithMctrl
} from '$lib/services/mission-control/mission-control.services';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { bigintStringify } from '$lib/utils/number.utils';
import { orbiterName } from '$lib/utils/orbiter.utils';
import { satelliteName } from '$lib/utils/satellite.utils';
import { nonNullish, notEmptyString } from '@dfinity/utils';
import type { PrincipalText } from '@dfinity/zod-schemas';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

interface SetCliControllersParams {
	// If set, then controllers are set with the Mission Control
	// else, they are set directly
	missionControlId: Option<MissionControlId>;
	controllerId: PrincipalText;
	profile: Option<string>;
	identity: Identity;
	selectedMissionControl: boolean;
	selectedSatellites: [Principal, MissionControlDid.Satellite][];
	selectedOrbiters: [Principal, MissionControlDid.Orbiter][];
}

export const setCliControllers = async ({
	missionControlId,
	...params
}: SetCliControllersParams): Promise<
	{ success: 'ok'; redirectQueryParams: string[] } | { success: 'error'; err: unknown }
> => {
	try {
		if (nonNullish(missionControlId)) {
			await setCliControllersWithMissionControl({ missionControlId, ...params });
		} else {
			await setCliControllersWithoutMissionControl(params);
		}

		return {
			success: 'ok',
			redirectQueryParams: buildRedirectParameters({ missionControlId, ...params })
		};
	} catch (err: unknown) {
		return { success: 'error', err };
	}
};

const setCliControllersWithoutMissionControl = async ({
	controllerId,
	profile,
	identity,
	selectedSatellites,
	selectedOrbiters
}: Omit<SetCliControllersParams, 'missionControlId' | 'selectedMissionControl'>) => {
	await Promise.all([
		...(selectedSatellites.length > 0
			? [
					setSatellitesAdminAccessKey({
						accessKeyId: controllerId,
						satelliteIds: selectedSatellites.map((s) => s[0]),
						profile,
						scope: 'admin',
						identity
					})
				]
			: []),
		...(selectedOrbiters.length > 0
			? [
					setOrbiterAdminAccessKey({
						accessKeyId: controllerId,
						orbiterIds: selectedOrbiters.map((s) => s[0]),
						profile,
						scope: 'admin',
						identity
					})
				]
			: [])
	]);
};

const setCliControllersWithMissionControl = async ({
	selectedMissionControl,
	missionControlId,
	controllerId,
	profile,
	identity,
	selectedSatellites,
	selectedOrbiters
}: Omit<SetCliControllersParams, 'missionControlId'> & { missionControlId: MissionControlId }) => {
	await Promise.all([
		...(selectedMissionControl
			? [
					setMissionControlControllerForVersion({
						missionControlId,
						accessKeyId: controllerId,
						profile,
						scope: 'admin',
						identity
					})
				]
			: []),
		...(selectedSatellites.length > 0
			? [
					setSatellitesControllerForVersionWithMctrl({
						missionControlId,
						accessKeyId: controllerId,
						satelliteIds: selectedSatellites.map((s) => s[0]),
						profile,
						scope: 'admin',
						identity
					})
				]
			: []),
		...(selectedOrbiters.length > 0
			? [
					setOrbitersControllerWithMctrl({
						missionControlId,
						accessKeyId: controllerId,
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
		selectedMissionControl && nonNullish(missionControlId)
			? `mission_control=${missionControlId.toText()}`
			: undefined,
		profile !== '' ? `profile=${profile}` : undefined
	].filter((param) => notEmptyString(param));
