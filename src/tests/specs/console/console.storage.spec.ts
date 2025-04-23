import type {
	CommitProposal,
	_SERVICE as ConsoleActor,
	HttpRequest,
	InitAssetKey,
	ProposalType,
	UploadChunk
} from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import type { StorageConfig } from '$declarations/satellite/satellite.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import {
	arrayBufferToUint8Array,
	assertNonNullish,
	fromNullable,
	toNullable,
	uint8ArrayToHexString
} from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from '../../constants/console-tests.constants';
import { mockBlob, mockHtml } from '../../mocks/storage.mocks';
import { assertCertification } from '../../utils/certification-test.utils';
import { uploadFile } from '../../utils/console-tests.utils';
import { sha256ToBase64String } from '../../utils/crypto-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Storage', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactorConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		canisterId = cId;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on delete proposal assets', async () => {
			const { delete_proposal_assets } = actor;

			await expect(delete_proposal_assets({ proposal_ids: [1n] })).rejects.toThrow(
				CONTROLLER_ERROR_MSG
			);
		});

		it('should throw errors on init proposal', async () => {
			const { init_proposal } = actor;

			await expect(init_proposal({ AssetsUpgrade: { clear_existing_assets: [] } })).rejects.toThrow(
				CONTROLLER_ERROR_MSG
			);
		});

		it('should throw errors on submit proposal', async () => {
			const { submit_proposal } = actor;

			await expect(submit_proposal(123n)).rejects.toThrow(CONTROLLER_ERROR_MSG);
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

		it('should throw errors on commit proposal', async () => {
			const { commit_proposal } = actor;

			const commit: CommitProposal = {
				sha256: [1, 2, 3],
				proposal_id: 123n
			};

			await expect(commit_proposal(commit)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on list assets', async () => {
			const { list_assets } = actor;

			await expect(
				list_assets('#dapp', { matcher: [], order: [], owner: [], paginate: [] })
			).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on setting config', async () => {
			const { set_storage_config } = actor;

			await expect(
				set_storage_config({
					headers: [],
					iframe: toNullable(),
					redirects: toNullable(),
					rewrites: [],
					raw_access: toNullable(),
					max_memory_size: toNullable()
				})
			).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should set and get config', async () => {
			const { set_storage_config, get_storage_config } = actor;

			const config: StorageConfig = {
				headers: [['*', [['Cache-Control', 'no-cache']]]],
				iframe: toNullable({ Deny: null }),
				redirects: [],
				rewrites: [],
				raw_access: toNullable(),
				max_memory_size: toNullable()
			};

			await set_storage_config(config);

			const savedConfig = await get_storage_config();

			expect(savedConfig).toEqual(config);
		});

		describe.each([
			{
				proposal_type: {
					AssetsUpgrade: {
						clear_existing_assets: toNullable()
					}
				} as ProposalType,
				collection: '#dapp',
				full_path: '/hello.html',
				expected_proposal_id: 1n
			},
			{
				proposal_type: {
					SegmentsDeployment: {
						mission_control_version: [],
						orbiter: [],
						satellite_version: ['0.0.18']
					}
				} as ProposalType,
				collection: '#releases',
				full_path: '/releases/satellite-v0.0.18.wasm.gz',
				expected_proposal_id: 2n
			}
		])(
			'Proposal, upload and serve',
			({ proposal_type, collection, full_path, expected_proposal_id }) => {
				let sha256: [] | [Uint8Array | number[]];
				let proposalId: bigint;

				it('should init a proposal', async () => {
					const { init_proposal } = actor;

					const [id, proposal] = await init_proposal(proposal_type);

					proposalId = id;

					expect(proposalId).toEqual(expected_proposal_id);

					expect(proposal.status).toEqual({ Initialized: null });
					expect(fromNullable(proposal.sha256)).toBeUndefined();
					expect(fromNullable(proposal.executed_at)).toBeUndefined();
					expect(proposal.owner.toText()).toEqual(controller.getPrincipal().toText());
					expect(proposal.proposal_type).toEqual(proposal_type);
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
								collection,
								description: toNullable(),
								encoding_type: [],
								full_path,
								name: 'hello.html',
								token: toNullable()
							},
							unknownProposalId
						)
					).rejects.toThrow(`No proposal found for ${unknownProposalId}`);
				});

				it('should upload asset', async () => {
					const { http_request, commit_asset_upload, upload_asset_chunk, init_asset_upload } =
						actor;

					const file = await init_asset_upload(
						{
							collection,
							description: toNullable(),
							encoding_type: [],
							full_path,
							name: 'hello.html',
							token: toNullable()
						},
						proposalId
					);

					const chunk = await upload_asset_chunk({
						batch_id: file.batch_id,
						content: arrayBufferToUint8Array(await mockBlob.arrayBuffer()),
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
						url: full_path
					});

					expect(status_code).toBe(404);
				});

				it('should fail at submitting an unknown proposal', async () => {
					const { submit_proposal } = actor;

					const unknownProposalId = proposalId + 1n;

					await expect(submit_proposal(unknownProposalId)).rejects.toThrow(
						'Cannot submit proposal.'
					);
				});

				it('should submit proposal', async () => {
					const { submit_proposal } = actor;

					// Advance time for updated_at
					await pic.advanceTime(100);

					const [_, proposal] = await submit_proposal(proposalId);

					expect(proposal.status).toEqual({ Open: null });
					expect(sha256ToBase64String(fromNullable(proposal.sha256) ?? [])).not.toBeUndefined();
					expect(fromNullable(proposal.executed_at)).toBeUndefined();
					expect(proposal.owner.toText()).toEqual(controller.getPrincipal().toText());
					expect(proposal.proposal_type).toEqual(proposal_type);
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
						url: full_path
					});

					expect(status_code).toBe(404);
				});

				it('should fail at submitting a proposal if already open', async () => {
					const { submit_proposal } = actor;

					await expect(submit_proposal(proposalId)).rejects.toThrow(
						'Proposal cannot be submitted. Current status: Open'
					);
				});

				it('should fail at committing a proposal if unknown', async () => {
					const { commit_proposal } = actor;

					const unknownProposalId = proposalId + 1n;

					await expect(
						commit_proposal({
							sha256: Array.from({ length: 32 }).map((_, i) => i),
							proposal_id: proposalId + 1n
						})
					).rejects.toThrow(`Cannot commit proposal. ${unknownProposalId}`);
				});

				it('should fail at committing a proposal with incorrect sha256', async () => {
					const { commit_proposal } = actor;

					const sha256 = Array.from({ length: 32 }).map((_, i) => i);

					await expect(
						commit_proposal({
							sha256,
							proposal_id: proposalId
						})
					).rejects.toThrow(
						`The provided SHA-256 hash (${uint8ArrayToHexString(sha256)}) does not match the expected value for the proposal to commit.`
					);
				});

				it('should not update proposal status', async () => {
					const { get_proposal } = actor;

					const proposal = fromNullable(await get_proposal(proposalId));

					assertNonNullish(proposal);

					expect(proposal.status).toEqual({ Open: null });
				});

				it('should commit proposal', async () => {
					const { commit_proposal } = actor;

					await expect(
						commit_proposal({
							sha256: fromNullable(sha256)!,
							proposal_id: proposalId
						})
					).resolves.not.toThrow();
				});

				it('should have updated proposal to executed', async () => {
					const { get_proposal } = actor;

					const proposal = fromNullable(await get_proposal(proposalId));

					assertNonNullish(proposal);

					expect(proposal.status).toEqual({ Executed: null });
				});

				it('should serve asset', async () => {
					const { http_request } = actor;

					await tick(pic);

					const request: HttpRequest = {
						body: [],
						certificate_version: toNullable(2),
						headers: [],
						method: 'GET',
						url: full_path
					};

					const response = await http_request(request);

					const { status_code, headers, body } = response;

					expect(status_code).toBe(200);

					const rest = headers.filter(([header, _]) => header !== 'IC-Certificate');

					/* eslint-disable no-useless-escape */
					expect(rest).toEqual([
						['accept-ranges', 'bytes'],
						['etag', '"03ee66f1452916b4f91a504c1e9babfa201b6d64c26a82b2cf03c3ed49d91585"'],
						['X-Content-Type-Options', 'nosniff'],
						['Strict-Transport-Security', 'max-age=31536000 ; includeSubDomains'],
						['Referrer-Policy', 'same-origin'],
						['X-Frame-Options', 'DENY'],
						['Cache-Control', 'no-cache'],
						[
							'IC-CertificateExpression',
							'default_certification(ValidationArgs{certification:Certification{no_request_certification:Empty{},response_certification:ResponseCertification{certified_response_headers:ResponseHeaderList{headers:[\"accept-ranges\",\"etag\",\"X-Content-Type-Options\",\"Strict-Transport-Security\",\"Referrer-Policy\",\"X-Frame-Options\",\"Cache-Control\"]}}}})'
						]
					]);
					/* eslint-enable no-useless-escape */

					await assertCertification({
						canisterId,
						pic,
						request,
						response,
						currentDate
					});

					const decoder = new TextDecoder();

					expect(decoder.decode(body as Uint8Array<ArrayBufferLike>)).toEqual(mockHtml);
				});

				it('should list assets', async () => {
					const { list_assets } = actor;

					const assets = await list_assets(collection, {
						matcher: [],
						order: [],
						owner: [],
						paginate: []
					});

					for (const [_, { version }] of assets.items) {
						expect(fromNullable(version)).not.toBeUndefined();
					}

					expect(assets.items.find(([fullPath]) => fullPath === full_path)).not.toBeUndefined();
				});
			}
		);

		it('should clear assets with proposal', async () => {
			const { http_request, init_proposal, commit_proposal, submit_proposal } = actor;

			const [proposalId, __] = await init_proposal({
				AssetsUpgrade: {
					clear_existing_assets: toNullable(true)
				}
			});

			await uploadFile({ proposalId, actor });

			const [_, proposal] = await submit_proposal(proposalId);

			await commit_proposal({
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
				url: '/hello3.html'
			});

			expect(status_code_200).toEqual(200);
		});

		it('should still serve asset after #dApp has been cleared', async () => {
			const { http_request } = actor;

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/releases/satellite-v0.0.18.wasm.gz'
			});

			expect(status_code).toBe(200);
		});

		it('should mark proposal as failed', async () => {
			const { init_proposal, commit_proposal, submit_proposal, get_proposal } = actor;

			const [proposalId, __] = await init_proposal({
				AssetsUpgrade: {
					clear_existing_assets: toNullable(false)
				}
			});

			// We do not upload any chunks and commit batch to make the proposal fail.

			const [_, { sha256 }] = await submit_proposal(proposalId);

			await expect(
				commit_proposal({
					sha256: fromNullable(sha256)!,
					proposal_id: proposalId
				})
			).rejects.toThrow(`Empty assets for proposal ID ${proposalId}.`);

			const proposal = fromNullable(await get_proposal(proposalId));

			assertNonNullish(proposal);

			expect(proposal.status).toEqual({ Failed: null });
		});

		describe('Releases assertions', () => {
			describe.each([
				'satellite.wasm.gz',
				'mission_control.wasm.gz',
				'orbiter.wasm.gz',
				'satellite.wasm',
				'mission_control.wasm',
				'orbiter.wasm',
				'satellite.txt',
				'mission_control.txt',
				'orbiter.txt'
			])(`Assert upload %s`, (filename) => {
				it('should throw error if try to upload without version', async () => {
					const { init_asset_upload, init_proposal } = actor;

					const [proposalId, _] = await init_proposal({
						AssetsUpgrade: {
							clear_existing_assets: toNullable()
						}
					});

					await expect(
						init_asset_upload(
							{
								collection: '#releases',
								description: toNullable(),
								encoding_type: [],
								full_path: `/releases/${filename}`,
								name: filename,
								token: toNullable()
							},
							proposalId
						)
					).rejects.toThrow(`/releases/${filename} does not match the required pattern.`);
				});
			});
		});

		it('should serve with content encoding', async () => {
			const {
				init_proposal,
				http_request,
				commit_proposal,
				submit_proposal,
				commit_asset_upload,
				upload_asset_chunk,
				init_asset_upload
			} = actor;

			const [proposalId, __] = await init_proposal({
				AssetsUpgrade: {
					clear_existing_assets: toNullable()
				}
			});

			const upload = async (gzip: boolean) => {
				const file = await init_asset_upload(
					{
						collection: '#dapp',
						description: toNullable(),
						encoding_type: gzip ? ['gzip'] : [],
						full_path: '/index.js',
						name: 'index.gz',
						token: toNullable()
					},
					proposalId
				);

				const blob = new Blob(['<script>console.log(123)</script>'], {
					type: 'text/javascript; charset=utf-8'
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
			};

			await upload(true);
			await upload(false);

			// Advance time for updated_at
			await pic.advanceTime(100);

			const [_, proposal] = await submit_proposal(proposalId);

			await commit_proposal({
				sha256: fromNullable(proposal.sha256)!,
				proposal_id: proposalId
			});

			const { headers } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [['Accept-Encoding', 'gzip, deflate, br']],
				method: 'GET',
				url: '/index.js'
			});

			expect(
				headers.find(([key, value]) => key === 'Content-Encoding' && value === 'gzip')
			).not.toBeUndefined();
		});
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should get proposal', async () => {
			const { get_proposal } = actor;

			const proposal = fromNullable(await get_proposal(1n));

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
