import type {
	CommitAssetsUpgrade,
	_SERVICE as ConsoleActor,
	InitAssetKey,
	UploadChunk
} from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { arrayBufferToUint8Array, fromNullable, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from './constants/console-tests.constants';
import { CONSOLE_WASM_PATH } from './utils/setup-tests.utils';

describe('Console', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactorConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on delete assets', async () => {
			const { delete_assets_upgrade } = actor;

			await expect(delete_assets_upgrade({ proposal_ids: [1n] })).rejects.toThrow(
				CONTROLLER_ERROR_MSG
			);
		});

		it('should throw errors on init assets upgrade', async () => {
			const { init_assets_upgrade } = actor;

			await expect(init_assets_upgrade({ clear_existing_assets: [] })).rejects.toThrow(
				CONTROLLER_ERROR_MSG
			);
		});

		it('should throw errors on propose assets upgrade', async () => {
			const { propose_assets_upgrade } = actor;

			await expect(propose_assets_upgrade(123n)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on init asset upload', async () => {
			const { init_asset_upload } = actor;

			const key: InitAssetKey = {
				token: toNullable(),
				collection: '#dapp',
				name: 'hello',
				description: toNullable(),
				encoding_type: toNullable(),
				full_path: '/hello.html'
			};

			await expect(init_asset_upload(key, 123n)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on propose assets upgrade', async () => {
			const { upload_asset_chunk } = actor;

			const chunk: UploadChunk = {
				content: [1, 2, 3],
				batch_id: 123n,
				order_id: []
			};

			await expect(upload_asset_chunk(chunk)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on commit asset upload', async () => {
			const { commit_asset_upload } = actor;

			const batch = {
				batch_id: 123n,
				headers: [],
				chunk_ids: [123n]
			};

			await expect(commit_asset_upload(batch)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on commit assets upgrade', async () => {
			const { commit_assets_upgrade } = actor;

			const commit: CommitAssetsUpgrade = {
				sha256: [1, 2, 3],
				proposal_id: 123n
			};

			await expect(commit_assets_upgrade(commit)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on list assets', async () => {
			const { list_assets } = actor;

			await expect(
				list_assets('#dapp', { matcher: [], order: [], owner: [], paginate: [] })
			).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		let proposalId: bigint;

		it('should init a assets upgrade', async () => {
			const { init_assets_upgrade } = actor;

			const [id, proposal] = await init_assets_upgrade({
				clear_existing_assets: toNullable()
			});

			proposalId = id;

			expect(proposalId).toEqual(1n);

			expect(proposal.status).toEqual({ Initialized: null });
			expect(fromNullable(proposal.sha256)).toBeUndefined();
			expect(fromNullable(proposal.executed_at)).toBeUndefined();
			expect(proposal.owner.toText()).toEqual(controller.getPrincipal().toText());
			expect(proposal.proposal_type).toEqual({
				AssetsUpgrade: { clear_existing_assets: toNullable() }
			});
			expect(proposal.created_at).not.toBeUndefined();
			expect(proposal.created_at).toBeGreaterThan(0n);
			expect(fromNullable(proposal.version) ?? 0n).toBeGreaterThan(0n);
		});

		it('should fail at uploading asset for unknown proposal', async () => {
			const { init_asset_upload } = actor;

			let unknownProposalId = proposalId + 1n;

			await expect(
				init_asset_upload(
					{
						collection: '#dapp',
						description: toNullable(),
						encoding_type: [],
						full_path: '/hello.html',
						name: 'hello.html',
						token: toNullable()
					},
					unknownProposalId
				)
			).rejects.toThrowError(new RegExp(`No proposal found for ${unknownProposalId}`, 'i'));
		});

		it('should upload asset', async () => {
			const { http_request, commit_asset_upload, upload_asset_chunk, init_asset_upload } = actor;

			const file = await init_asset_upload(
				{
					collection: '#dapp',
					description: toNullable(),
					encoding_type: [],
					full_path: '/hello.html',
					name: 'hello.html',
					token: toNullable()
				},
				proposalId
			);

			const HTML = '<html><body>Hello</body></html>';

			const blob = new Blob([HTML], {
				type: 'text/plain; charset=utf-8'
			});

			const chunk = await upload_asset_chunk({
				batch_id: file.batch_id,
				content: arrayBufferToUint8Array(await blob.arrayBuffer()),
				order_id: [0n]
			});

			await commit_asset_upload({
				batch_id: file.batch_id,
				chunk_ids: [chunk.chunk_id],
				headers: []
			});

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/hello.html'
			});

			expect(status_code).toBe(404);
		});
	});
});
