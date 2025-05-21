import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import type { _SERVICE as ConsoleActor_0_0_8 } from '$declarations/deprecated/console-0-0-8-patch1.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import type { Actor, PocketIc } from '@hadronous/pic';
import { readFile } from 'node:fs/promises';
import { expect } from 'vitest';
import { MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG } from '../constants/mission-control-tests.constants';
import { tick } from './pic-tests.utils';
import {
	downloadMissionControl,
	downloadOrbiter,
	downloadSatellite,
	MISSION_CONTROL_WASM_PATH,
	ORBITER_WASM_PATH,
	SATELLITE_WASM_PATH,
	WASM_VERSIONS
} from './setup-tests.utils';

const installRelease = async ({
	download,
	segment,
	version,
	actor
}: {
	download: (version: string) => Promise<string>;
	segment: { Satellite: null } | { Orbiter: null } | { MissionControl: null };
	version: string;
	actor: Actor<ConsoleActor_0_0_8>;
}) => {
	const { load_release, reset_release } = actor;

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

const versionSatellite = '0.0.18';
const versionOrbiter = '0.0.7';
const versionMissionControl = '0.0.11';

const uploadSegment = async ({
	segment,
	version,
	actor,
	proposalId
}: {
	segment: 'satellite' | 'mission_control' | 'orbiter';
	version: string;
	actor: Actor<ConsoleActor>;
	proposalId: bigint;
}) => {
	const { init_asset_upload, upload_asset_chunk, commit_asset_upload } = actor;

	const name = `${segment}-v${version}.wasm.gz`;
	const fullPath = `/releases/${name}`;

	let wasmPath: string;
	switch (segment) {
		case 'mission_control':
			wasmPath = MISSION_CONTROL_WASM_PATH;
			break;
		case 'orbiter':
			wasmPath = ORBITER_WASM_PATH;
			break;
		default:
			wasmPath = SATELLITE_WASM_PATH;
	}

	const data = new Blob([await readFile(wasmPath)]);

	const { batch_id: batchId } = await init_asset_upload(
		{
			collection: '#releases',
			description: toNullable(),
			encoding_type: ['identity'],
			full_path: fullPath,
			name,
			token: toNullable()
		},
		proposalId
	);

	const chunkSize = 1900000;

	const uploadChunks = [];

	let orderId = 0n;
	for (let start = 0; start < data.size; start += chunkSize) {
		const chunk = data.slice(start, start + chunkSize);

		uploadChunks.push({
			batchId,
			chunk,
			orderId
		});

		orderId++;
	}

	// eslint-disable-next-line func-style
	async function* batchUploadChunks({
		uploadChunks,
		limit = 12
	}: {
		uploadChunks: UploadChunk[];
		limit?: number;
	}) {
		for (let i = 0; i < uploadChunks.length; i = i + limit) {
			const batch = uploadChunks.slice(i, i + limit);
			const result = await Promise.all(batch.map((params) => uploadChunk(params)));
			yield result;
		}
	}

	interface UploadChunk {
		batchId: bigint;
		chunk: Blob;
		orderId: bigint;
	}

	const uploadChunk = async ({ batchId, chunk, orderId }: UploadChunk) =>
		upload_asset_chunk({
			batch_id: batchId,
			content: new Uint8Array(await chunk.arrayBuffer()),
			order_id: toNullable(orderId)
		});

	let chunkIds: { chunk_id: bigint }[] = [];
	for await (const results of batchUploadChunks({ uploadChunks })) {
		chunkIds = [...chunkIds, ...results];
	}

	const headers: [string, string][] = [['Content-Encoding', 'gzip']];

	const contentType: [string, string][] | undefined =
		headers.find(([type, _]) => type.toLowerCase() === 'content-type') === undefined &&
		data.type !== undefined &&
		data.type !== ''
			? [['Content-Type', data.type]]
			: undefined;

	await commit_asset_upload({
		batch_id: batchId,
		chunk_ids: chunkIds.map(({ chunk_id }) => chunk_id),
		headers: [...headers, ...(contentType ?? [])]
	});
};

export const deploySegments = async (actor: Actor<ConsoleActor>) => {
	const { init_proposal, submit_proposal, commit_proposal } = actor;

	const [proposalId, _] = await init_proposal({
		SegmentsDeployment: {
			orbiter: toNullable(WASM_VERSIONS.orbiter),
			mission_control_version: toNullable(WASM_VERSIONS.mission_control),
			satellite_version: toNullable(WASM_VERSIONS.satellite)
		}
	});

	await uploadSegment({
		segment: 'satellite',
		version: WASM_VERSIONS.satellite,
		actor,
		proposalId
	});

	await uploadSegment({
		segment: 'orbiter',
		version: WASM_VERSIONS.orbiter,
		actor,
		proposalId
	});

	await uploadSegment({
		segment: 'mission_control',
		version: WASM_VERSIONS.mission_control,
		actor,
		proposalId
	});

	const [__, { sha256 }] = await submit_proposal(proposalId);

	const definedSha256 = fromNullable(sha256);

	assertNonNullish(definedSha256);

	await commit_proposal({
		proposal_id: proposalId,
		sha256: definedSha256
	});
};

export const installReleases = async (actor: Actor<ConsoleActor_0_0_8>) => {
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

	await testReleases(actor);
};

export const testReleases = async (actor: Actor<ConsoleActor_0_0_8>) => {
	const { get_releases_version } = actor;

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
	actor: Actor<ConsoleActor | ConsoleActor_0_0_8>;
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
	actor: Actor<ConsoleActor | ConsoleActor_0_0_8>;
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

		const { get_user } = pic.createActor<MissionControlActor>(
			idlFactorMissionControl,
			missionControlId!
		);

		// The Mission Control has no public functions. If it rejects a call with a particular error message it means it exists.
		await expect(get_user()).rejects.toThrow(MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG);
	}
};
