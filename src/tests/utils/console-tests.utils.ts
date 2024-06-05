import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { readFile } from 'node:fs/promises';
import { expect } from 'vitest';
import { tick } from './pic-tests.utils';
import { downloadMissionControl, downloadOrbiter, downloadSatellite } from './setup-tests.utils';

const installRelease = async ({
	download,
	segment,
	version,
	actor
}: {
	download: (version: string) => Promise<string>;
	segment: { Satellite: null } | { Orbiter: null } | { MissionControl: null };
	version: string;
	actor: Actor<ConsoleActor>;
}) => {
	const { load_release, reset_release, get_releases_version } = actor;

	await reset_release(segment);

	const destination = await download(version);

	const buffer = await readFile(destination);
	const wasmModule = [...new Uint8Array(buffer)];

	const chunkSize = 700000;

	const upload = async (chunks: number[]) => {
		await load_release(segment, chunks, version);
	};

	for (let start = 0; start < wasmModule.length; start += chunkSize) {
		const chunks = wasmModule.slice(start, start + chunkSize);
		await upload(chunks);
	}
};

export const installReleases = async (actor: Actor<ConsoleActor>) => {
	const { get_releases_version, reset_release } = actor;

	const versionSatellite = '0.0.17';
	const versionOrbiter = '0.0.7';
	const versionMissionControl = '0.0.10';

	await installRelease({
		download: downloadSatellite,
		version: versionSatellite,
		segment: { Satellite: null },
		actor
	});

	await installRelease({
		download: downloadOrbiter,
		version: versionOrbiter,
		segment: { Orbiter: null },
		actor
	});

	await installRelease({
		download: downloadMissionControl,
		version: versionMissionControl,
		segment: { MissionControl: null },
		actor
	});

	const { satellite, mission_control, orbiter } = await get_releases_version();

	expect(fromNullable(satellite)).toEqual(versionSatellite);
	expect(fromNullable(orbiter)).toEqual(versionOrbiter);
	expect(fromNullable(mission_control)).toEqual(versionMissionControl);
};

export const initMissionControls = async ({
	actor,
	pic,
	length
}: {
	actor: Actor<ConsoleActor>;
	pic: PocketIc;
	length: number;
}): Promise<Identity[]> => {
	const users = await Promise.all(Array.from({ length }).map(() => Ed25519KeyIdentity.generate()));

	for (const user of users) {
		actor.setIdentity(user);

		const { init_user_mission_control_center } = actor;
		await init_user_mission_control_center();

		await tick(pic);
	}

	return users;
};

export const testSatelliteExists = async ({
	users,
	actor,
	pic
}: {
	users: Identity[];
	actor: Actor<ConsoleActor>;
	pic: PocketIc;
}) => {
	const { list_user_mission_control_centers } = actor;

	const missionControls = await list_user_mission_control_centers();

	for (const user of users) {
		const missionControl = missionControls.find(
			([key]) => key.toText() === user.getPrincipal().toText()
		);

		expect(missionControl).not.toBeUndefined();

		const [_, { mission_control_id }] = missionControl!;

		const missionControlId = fromNullable(mission_control_id);

		expect(missionControlId).not.toBeUndefined();

		const { version } = pic.createActor<MissionControlActor>(
			idlFactorMissionControl,
			missionControlId!
		);

		await expect(version()).resolves.not.toThrowError();
	}
};
