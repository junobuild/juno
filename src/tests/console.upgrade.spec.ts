import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { fromNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import { tick } from './utils/pic-tests.utils';
import {
	CONSOLE_WASM_PATH,
	downloadConsole,
	downloadMissionControl,
	downloadOrbiter,
	downloadSatellite
} from './utils/setup-tests.utils';

describe('Console upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const installRelease = async ({
		download,
		segment,
		version
	}: {
		download: (version: string) => Promise<string>;
		segment: { Satellite: null } | { Orbiter: null } | { MissionControl: null };
		version: string;
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

	const installReleases = async () => {
		const { get_releases_version, reset_release } = actor;

		const versionSatellite = '0.0.17';
		const versionOrbiter = '0.0.7';
		const versionMissionControl = '0.0.10';

		await installRelease({
			download: downloadSatellite,
			version: versionSatellite,
			segment: { Satellite: null }
		});

		await installRelease({
			download: downloadOrbiter,
			version: versionOrbiter,
			segment: { Orbiter: null }
		});

		await installRelease({
			download: downloadMissionControl,
			version: versionMissionControl,
			segment: { MissionControl: null }
		});

		const { satellite, mission_control, orbiter } = await get_releases_version();

		expect(fromNullable(satellite)).toEqual(versionSatellite);
		expect(fromNullable(orbiter)).toEqual(versionOrbiter);
		expect(fromNullable(mission_control)).toEqual(versionMissionControl);
	};

	describe('v0.0.8 -> v0.0.9', async () => {
		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadConsole({ junoVersion: '0.0.30', version: '0.0.8' });

			const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor>({
				idlFactory: idlFactorConsole,
				wasm: destination,
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);

			await installReleases();
		});

		const initMissionControls = async (): Promise<Identity[]> => {
			const users = await Promise.all(
				Array.from({ length: 3 }).map(() => Ed25519KeyIdentity.generate())
			);

			for (const user of users) {
				actor.setIdentity(user);

				const { init_user_mission_control_center } = actor;
				await init_user_mission_control_center();
			}

			actor.setIdentity(controller);

			return users;
		};

		const testUsers = async (users: Identity[]) => {
			const { list_user_mission_control_centers } = actor;

			const missionControls = await list_user_mission_control_centers();

			expect(missionControls).toHaveLength(users.length);

			for (const user of users) {
				expect(
					missionControls.find(([key]) => key.toText() === user.getPrincipal().toText())
				).not.toBeUndefined();
			}
		};

		describe('Heap state', () => {
			it('should still list mission controls and payments', async () => {
				const originalUsers = await initMissionControls();

				await testUsers(originalUsers);

				await upgrade();

				await testUsers(originalUsers);
			});
		});
	});
});
