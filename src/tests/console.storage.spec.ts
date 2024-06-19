import type {
	CommitAssetsUpgrade,
	_SERVICE as ConsoleActor,
	InitAssetKey,
	UploadChunk
} from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import type { StorageConfig } from '$declarations/satellite/satellite.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import {
	arrayBufferToUint8Array,
	fromNullable,
	toNullable,
	uint8ArrayToHexString
} from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { assertNonNullish } from '@junobuild/utils';
import { beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from './constants/console-tests.constants';
import { sha256ToBase64String } from './utils/crypto-tests.utils';
import { CONSOLE_WASM_PATH } from './utils/setup-tests.utils';

describe('Console / Storage', () => {
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

		it('should throw errors on setting config', async () => {
			const { set_config } = actor;

			await expect(
				set_config({
					storage: {
						headers: [],
						iframe: toNullable(),
						redirects: toNullable(),
						rewrites: [],
						raw_access: toNullable()
					}
				})
			).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	});

	let proposalId: bigint;

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		let sha256: [] | [Uint8Array | number[]];

		const HTML = '<html><body>Hello</body></html>';

		it('should set and get config', async () => {
			const { set_config, get_config } = actor;

			const storage: StorageConfig = {
				headers: [['*', [['Cache-Control', 'no-cache']]]],
				iframe: toNullable({ Deny: null }),
				redirects: [],
				rewrites: [],
				raw_access: toNullable()
			};

			await set_config({
				storage
			});

			const configs = await get_config();

			expect(configs).toEqual({
				storage
			});
		});

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
			expect(proposal.updated_at).not.toBeUndefined();
			expect(proposal.updated_at).toBeGreaterThan(0n);
			expect(fromNullable(proposal.version) ?? 0n).toBeGreaterThan(0n);
		});

		it('should fail at uploading asset for unknown proposal', async () => {
			const { init_asset_upload } = actor;

			const unknownProposalId = proposalId + 1n;

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
			).rejects.toThrow(`No proposal found for ${unknownProposalId}`);
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

		it('should fail at proposing an unknown proposal', async () => {
			const { propose_assets_upgrade } = actor;

			const unknownProposalId = proposalId + 1n;

			await expect(propose_assets_upgrade(unknownProposalId)).rejects.toThrow(
				'Cannot propose assets upgrade.'
			);
		});

		it('should propose proposal', async () => {
			const { propose_assets_upgrade } = actor;

			// Advance time for updated_at
			await pic.advanceTime(100);

			const [_, proposal] = await propose_assets_upgrade(proposalId);

			expect(proposal.status).toEqual({ Open: null });
			expect(sha256ToBase64String(fromNullable(proposal.sha256) ?? [])).not.toBeUndefined();
			expect(fromNullable(proposal.executed_at)).toBeUndefined();
			expect(proposal.owner.toText()).toEqual(controller.getPrincipal().toText());
			expect(proposal.proposal_type).toEqual({
				AssetsUpgrade: { clear_existing_assets: toNullable() }
			});
			expect(proposal.created_at).not.toBeUndefined();
			expect(proposal.created_at).toBeGreaterThan(0n);
			expect(proposal.updated_at).not.toBeUndefined();
			expect(proposal.updated_at).toBeGreaterThan(0n);
			expect(proposal.updated_at).toBeGreaterThan(proposal.created_at);
			expect(fromNullable(proposal.version) ?? 0n).toEqual(2n);

			sha256 = proposal.sha256;
		});

		it('should still not serve asset', async () => {
			const { http_request } = actor;

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/hello.html'
			});

			expect(status_code).toBe(404);
		});

		it('should fail at proposing a proposal if already open', async () => {
			const { propose_assets_upgrade } = actor;

			await expect(propose_assets_upgrade(proposalId)).rejects.toThrow(
				'Proposal assets cannot be proposed. Current status: Open'
			);
		});

		it('should fail at committing a proposal if unknown', async () => {
			const { commit_assets_upgrade } = actor;

			const unknownProposalId = proposalId + 1n;

			await expect(
				commit_assets_upgrade({
					sha256: Array.from({ length: 32 }).map((_, i) => i),
					proposal_id: proposalId + 1n
				})
			).rejects.toThrow(`Cannot propose assets upgrade. ${unknownProposalId}`);
		});

		it('should fail at committing a proposal with incorrect sha256', async () => {
			const { commit_assets_upgrade } = actor;

			const sha256 = Array.from({ length: 32 }).map((_, i) => i);

			await expect(
				commit_assets_upgrade({
					sha256,
					proposal_id: proposalId
				})
			).rejects.toThrow(
				`The provided SHA-256 hash (${uint8ArrayToHexString(sha256)}) does not match the expected value for the proposal to commit.`
			);
		});

		it('should commit proposal', async () => {
			const { commit_assets_upgrade } = actor;

			await expect(
				commit_assets_upgrade({
					sha256: fromNullable(sha256)!,
					proposal_id: proposalId
				})
			).resolves.not.toThrowError();
		});

		it('should serve asset', async () => {
			const { http_request } = actor;

			const { status_code, headers, body } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/hello.html'
			});

			expect(status_code).toBe(200);

			const rest = headers.filter(([header, _]) => header !== 'IC-Certificate');

			expect(rest).toEqual([
				['accept-ranges', 'bytes'],
				['etag', '"03ee66f1452916b4f91a504c1e9babfa201b6d64c26a82b2cf03c3ed49d91585"'],
				['X-Content-Type-Options', 'nosniff'],
				['Strict-Transport-Security', 'max-age=31536000 ; includeSubDomains'],
				['Referrer-Policy', 'same-origin'],
				['X-Frame-Options', 'DENY'],
				['Cache-Control', 'no-cache']
			]);

			const certificate = headers.find(([header, _]) => header === 'IC-Certificate');

			expect(certificate).not.toBeUndefined();

			const [_, value] = certificate as [string, string];
			expect(value.substring(value.indexOf('tree=:'))).toEqual(
				'tree=:2dn3gwGDAktodHRwX2Fzc2V0c4EAggRYIEKdEzNVVN//oyhbMyr+jpaHvXLSS++G0FDxoOHNPxMy:'
			);

			const decoder = new TextDecoder();
			expect(decoder.decode(body as ArrayBuffer)).toEqual(HTML);
		});

		it('should list assets', async () => {
			const { list_assets } = actor;

			const assets = await list_assets('#dapp', {
				matcher: [],
				order: [],
				owner: [],
				paginate: []
			});

			for (const [_, { version }] of assets.items) {
				expect(fromNullable(version)).not.toBeUndefined();
			}

			expect(assets.items.find(([fullPath]) => fullPath === '/hello.html')).not.toBeUndefined();
		});

		it('should clear assets on upgrade', async () => {
			const {
				http_request,
				init_assets_upgrade,
				commit_assets_upgrade,
				propose_assets_upgrade,
				commit_asset_upload,
				upload_asset_chunk,
				init_asset_upload
			} = actor;

			const [proposalId, __] = await init_assets_upgrade({
				clear_existing_assets: toNullable(true)
			});

			const file = await init_asset_upload(
				{
					collection: '#dapp',
					description: toNullable(),
					encoding_type: [],
					full_path: '/hello2.html',
					name: 'hello2.html',
					token: toNullable()
				},
				proposalId
			);

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

			const [_, proposal] = await propose_assets_upgrade(proposalId);

			await commit_assets_upgrade({
				sha256: fromNullable(proposal.sha256)!,
				proposal_id: proposalId
			});

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/hello.html'
			});

			expect(status_code).toEqual(404);

			const { status_code: status_code_200 } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/hello2.html'
			});

			expect(status_code_200).toEqual(200);
		});
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should get proposal', async () => {
			const { get_proposal } = actor;

			const proposal = fromNullable(await get_proposal(proposalId));

			assertNonNullish(proposal);

			expect(proposal.status).toEqual({ Executed: null });
			expect(sha256ToBase64String(fromNullable(proposal.sha256) ?? [])).not.toBeUndefined();
			expect(fromNullable(proposal.executed_at)).not.toBeUndefined();
			expect(proposal.owner.toText()).toEqual(controller.getPrincipal().toText());
			expect(proposal.proposal_type).toEqual({
				AssetsUpgrade: { clear_existing_assets: toNullable() }
			});
			expect(proposal.created_at).not.toBeUndefined();
			expect(proposal.created_at).toBeGreaterThan(0n);
			expect(proposal.updated_at).not.toBeUndefined();
			expect(proposal.updated_at).toBeGreaterThan(0n);
			expect(proposal.updated_at).toBeGreaterThan(proposal.created_at);
			expect(fromNullable(proposal.version) ?? 0n).toEqual(3n);
		});
	});
});
