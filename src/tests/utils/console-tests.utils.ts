import {
	type ConsoleActor,
	type ConsoleActor0014,
	type ConsoleActor008,
	type MissionControlActor,
	idlFactoryMissionControl
} from '$declarations';
import type { InitAssetKey } from '$declarations/console/console.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import {
	arrayBufferToUint8Array,
	assertNonNullish,
	fromNullable,
	toNullable
} from '@dfinity/utils';
import { readFile } from 'node:fs/promises';
import { mockScript } from '../mocks/storage.mocks';
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

const installReleaseWithDeprecatedFlow = async ({
	download,
	segment,
	version,
	actor
}: {
	download: (version: string) => Promise<string>;
	segment: { Satellite: null } | { Orbiter: null } | { MissionControl: null };
	version: string;
	actor: Actor<ConsoleActor008>;
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
	actor: Actor<ConsoleActor | ConsoleActor0014>;
	proposalId: bigint;
}) => {
	const upload_proposal_asset_chunk =
		'upload_asset_chunk' in actor
			? (actor as ConsoleActor0014).upload_asset_chunk
			: (actor as ConsoleActor).upload_proposal_asset_chunk;

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

	const initPayload: InitAssetKey = {
		collection: '#releases',
		description: toNullable(`change=${proposalId};version=v${version}`),
		encoding_type: ['identity'],
		full_path: fullPath,
		name,
		token: toNullable()
	};

	const init = async (): Promise<bigint> => {
		if ('init_asset_upload' in actor) {
			const { batch_id: batchId } = await (actor as ConsoleActor0014).init_asset_upload(
				initPayload,
				proposalId
			);

			return batchId;
		}

		const [[_, { batch_id: batchId }]] = await (
			actor as ConsoleActor
		).init_proposal_many_assets_upload([initPayload], proposalId);

		return batchId;
	};

	const batchId = await init();

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
		upload_proposal_asset_chunk({
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

	const upload = async () => {
		const payload = {
			batch_id: batchId,
			chunk_ids: chunkIds.map(({ chunk_id }) => chunk_id),
			headers: [...headers, ...(contentType ?? [])]
		};

		if ('commit_asset_upload' in actor) {
			await (actor as ConsoleActor0014).commit_asset_upload(payload);

			return;
		}

		await (actor as ConsoleActor).commit_proposal_many_assets_upload([payload]);
	};

	await upload();
};

export const deploySegments = async (actor: Actor<ConsoleActor | ConsoleActor0014>) => {
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

export const installReleasesWithDeprecatedFlow = async (actor: Actor<ConsoleActor008>) => {
	await installReleaseWithDeprecatedFlow({
		download: downloadSatellite,
		version: versionSatellite,
		segment: { Satellite: null },
		actor
	});

	await installReleaseWithDeprecatedFlow({
		download: downloadOrbiter,
		version: versionOrbiter,
		segment: { Orbiter: null },
		actor
	});

	await installReleaseWithDeprecatedFlow({
		download: downloadMissionControl,
		version: versionMissionControl,
		segment: { MissionControl: null },
		actor
	});

	await testReleases(actor);
};

export const testReleases = async (actor: Actor<ConsoleActor008>) => {
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
	actor: Actor<ConsoleActor | ConsoleActor008 | ConsoleActor0014>;
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
	actor: Actor<ConsoleActor | ConsoleActor008 | ConsoleActor0014>;
	pic: PocketIc;
}) => {
	const { list_user_mission_control_centers } = actor;

	const missionControls = await list_user_mission_control_centers();

	for (const user of users) {
		const missionControl = missionControls.find(
			([key]) => key.toText() === user.getPrincipal().toText()
		);

		expect(missionControl).not.toBeUndefined();

		assertNonNullish(missionControl);

		const [_, { mission_control_id }] = missionControl;

		const missionControlId = fromNullable(mission_control_id);

		assertNonNullish(missionControlId);

		const { get_user } = pic.createActor<MissionControlActor>(
			idlFactoryMissionControl,
			missionControlId
		);

		try {
			await get_user();

			expect(true).toBeFalsy();
		} catch (err: unknown) {
			// The Mission Control has no public functions. If it rejects a call with a particular error message it means it exists.
			expect(
				(err as Error).message.includes(
					'Caller is not the owner or a controller of the mission control.'
				) ||
					(err as Error).message.includes(
						'Caller is not an admin controller of the mission control.'
					)
			).toBeTruthy();
		}
	}
};

export const uploadFileWithProposal = async ({
	actor,
	pic,
	fullPath = '/index.js'
}: {
	actor: Actor<ConsoleActor | ConsoleActor0014>;
	pic: PocketIc;
	fullPath?: string;
}): Promise<{ proposalId: bigint; fullPath: string }> => {
	const upload_proposal_asset_chunk =
		'upload_asset_chunk' in actor
			? (actor as ConsoleActor0014).upload_asset_chunk
			: (actor as ConsoleActor).upload_proposal_asset_chunk;

	const { init_proposal, http_request, commit_proposal, submit_proposal } = actor;

	const [proposalId, __] = await init_proposal({
		AssetsUpgrade: {
			clear_existing_assets: toNullable()
		}
	});

	const upload = async (gzip: boolean) => {
		const initPayload: InitAssetKey = {
			collection: '#dapp',
			description: toNullable(),
			encoding_type: gzip ? ['gzip'] : [],
			full_path: fullPath,
			name: 'index.gz',
			token: toNullable()
		};

		const init = async () => {
			if ('init_asset_upload' in actor) {
				return await (actor as ConsoleActor0014).init_asset_upload(initPayload, proposalId);
			}

			const [[_, file]] = await (actor as ConsoleActor).init_proposal_many_assets_upload(
				[initPayload],
				proposalId
			);

			return file;
		};

		const file = await init();

		const blob = new Blob([mockScript], {
			type: 'text/javascript; charset=utf-8'
		});

		const chunk = await upload_proposal_asset_chunk({
			batch_id: file.batch_id,
			content: arrayBufferToUint8Array(await blob.arrayBuffer()),
			order_id: [0n]
		});

		const upload = async () => {
			const payload = {
				batch_id: file.batch_id,
				chunk_ids: [chunk.chunk_id],
				headers: []
			};

			if ('commit_asset_upload' in actor) {
				await (actor as ConsoleActor0014).commit_asset_upload(payload);
				return;
			}

			await (actor as ConsoleActor).commit_proposal_many_assets_upload([payload]);
		};

		await upload();
	};

	await upload(true);
	await upload(false);

	// Advance time for updated_at
	await pic.advanceTime(100);

	const [_, proposal] = await submit_proposal(proposalId);

	const sha = fromNullable(proposal.sha256);
	assertNonNullish(sha);

	await commit_proposal({
		sha256: sha,
		proposal_id: proposalId
	});

	await assertAssetServed({
		actor,
		fullPath,
		body: mockScript
	});

	const { headers } = await http_request({
		body: [],
		certificate_version: toNullable(),
		headers: [['accept-encoding', 'gzip, deflate, br']],
		method: 'GET',
		url: fullPath
	});

	expect(
		headers.find(([key, value]) => key.toLowerCase() === 'content-encoding' && value === 'gzip')
	).not.toBeUndefined();

	return { proposalId, fullPath };
};

export const assertAssetServed = async ({
	actor,
	fullPath,
	body: content
}: {
	actor: Actor<ConsoleActor | ConsoleActor0014>;
	fullPath: string;
	body: string;
}) => {
	const { http_request } = actor;

	const { status_code, body } = await http_request({
		body: [],
		certificate_version: toNullable(),
		headers: [['accept-encoding', 'gzip, deflate, br']],
		method: 'GET',
		url: fullPath
	});

	expect(status_code).toEqual(200);

	const decoder = new TextDecoder();

	expect(decoder.decode(body as Uint8Array<ArrayBufferLike>)).toEqual(content);
};

export const updateRateConfig = async ({
	actor
}: {
	actor: Actor<ConsoleActor008 | ConsoleActor0014 | ConsoleActor>;
}) => {
	const { update_rate_config } = actor;

	const config = {
		max_tokens: 100n,
		time_per_token_ns: 60n
	};

	await update_rate_config({ Satellite: null }, config);
	await update_rate_config({ Orbiter: null }, config);
	await update_rate_config({ MissionControl: null }, config);
};
