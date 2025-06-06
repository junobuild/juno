import type {
	CommitProposal,
	_SERVICE as ConsoleActor,
	HttpRequest,
	InitAssetKey,
	ProposalType,
	UploadChunk
} from '$declarations/console/console.did';
import type {
	_SERVICE as SatelliteActor,
	StorageConfig
} from '$declarations/satellite/satellite.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import {
	arrayBufferToUint8Array,
	assertNonNullish,
	fromNullable,
	toNullable,
	uint8ArrayToHexString
} from '@dfinity/utils';
import type { Actor, PocketIc } from '@hadronous/pic';
import {
	JUNO_CDN_PROPOSALS_ERROR_CANNOT_COMMIT,
	JUNO_CDN_PROPOSALS_ERROR_CANNOT_DELETE_ASSETS,
	JUNO_CDN_PROPOSALS_ERROR_CANNOT_DELETE_ASSETS_INVALID_STATUS,
	JUNO_CDN_PROPOSALS_ERROR_CANNOT_REJECT,
	JUNO_CDN_PROPOSALS_ERROR_CANNOT_REJECT_INVALID_STATUS,
	JUNO_CDN_PROPOSALS_ERROR_CANNOT_SUBMIT,
	JUNO_CDN_PROPOSALS_ERROR_CANNOT_SUBMIT_INVALID_STATUS,
	JUNO_CDN_PROPOSALS_ERROR_EMPTY_ASSETS,
	JUNO_CDN_PROPOSALS_ERROR_INVALID_HASH,
	JUNO_CDN_STORAGE_ERROR_INVALID_COLLECTION,
	JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_DESCRIPTION,
	JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH,
	JUNO_CDN_STORAGE_ERROR_MISSING_RELEASES_DESCRIPTION,
	JUNO_CDN_STORAGE_ERROR_NO_PROPOSAL_FOUND
} from '@junobuild/errors';
import { describe, expect } from 'vitest';
import { mockListProposalsParams } from '../mocks/list.mocks';
import { mockBlob, mockHtml } from '../mocks/storage.mocks';
import { uploadFile } from './cdn-tests.utils';
import { assertCertification } from './certification-tests.utils';
import { sha256ToBase64String } from './crypto-tests.utils';
import { tick } from './pic-tests.utils';
import { assertHeaders } from './storage-tests.utils';

/* eslint-disable vitest/require-top-level-describe */

export const testNotAllowedCdnMethods = ({
	actor,
	errorMsgAdminController,
	errorMsgWriteController,
	errorMsgController
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	errorMsgAdminController: string;
	errorMsgController?: string;
	errorMsgWriteController?: string;
}) => {
	it('should throw errors on init asset upload', async () => {
		const { init_proposal_asset_upload } = actor();

		const key: InitAssetKey = {
			token: toNullable(),
			collection: '#dapp',
			name: 'hello',
			description: toNullable(),
			encoding_type: toNullable(),
			full_path: '/hello.html'
		};

		await expect(init_proposal_asset_upload(key, 123n)).rejects.toThrow(
			errorMsgController ?? errorMsgWriteController ?? errorMsgAdminController
		);
	});

	it('should throw errors on propose assets upgrade', async () => {
		const { upload_proposal_asset_chunk } = actor();

		const chunk: UploadChunk = {
			content: [1, 2, 3],
			batch_id: 123n,
			order_id: []
		};

		await expect(upload_proposal_asset_chunk(chunk)).rejects.toThrow(
			errorMsgController ?? errorMsgWriteController ?? errorMsgAdminController
		);
	});

	it('should throw errors on commit asset upload', async () => {
		const { commit_proposal_asset_upload } = actor();

		const batch = {
			batch_id: 123n,
			headers: [],
			chunk_ids: [123n]
		};

		await expect(commit_proposal_asset_upload(batch)).rejects.toThrow(
			errorMsgController ?? errorMsgWriteController ?? errorMsgAdminController
		);
	});

	it('should throw errors on setting config', async () => {
		const { set_storage_config } = actor();

		await expect(
			set_storage_config({
				headers: [],
				iframe: toNullable(),
				redirects: toNullable(),
				rewrites: [],
				raw_access: toNullable(),
				max_memory_size: toNullable()
			})
		).rejects.toThrow(errorMsgAdminController);
	});

	it('should throw errors on getting storage config', async () => {
		const { get_storage_config } = actor();

		await expect(get_storage_config()).rejects.toThrow(errorMsgAdminController);
	});

	it('should throw errors on delete proposal assets', async () => {
		const { delete_proposal_assets } = actor();

		await expect(delete_proposal_assets({ proposal_ids: [1n] })).rejects.toThrow(
			errorMsgWriteController ?? errorMsgAdminController
		);
	});

	it('should throw errors on init proposal', async () => {
		const { init_proposal } = actor();

		await expect(init_proposal({ AssetsUpgrade: { clear_existing_assets: [] } })).rejects.toThrow(
			errorMsgController ?? errorMsgWriteController ?? errorMsgAdminController
		);
	});

	it('should throw errors on submit proposal', async () => {
		const { submit_proposal } = actor();

		await expect(submit_proposal(123n)).rejects.toThrow(
			errorMsgController ?? errorMsgWriteController ?? errorMsgAdminController
		);
	});

	it('should throw errors on reject proposal', async () => {
		const { reject_proposal } = actor();

		const commit: CommitProposal = {
			sha256: [1, 2, 3],
			proposal_id: 123n
		};

		await expect(reject_proposal(commit)).rejects.toThrow(
			errorMsgWriteController ?? errorMsgAdminController
		);
	});

	it('should throw errors on commit proposal', async () => {
		const { commit_proposal } = actor();

		const commit: CommitProposal = {
			sha256: [1, 2, 3],
			proposal_id: 123n
		};

		await expect(commit_proposal(commit)).rejects.toThrow(
			errorMsgWriteController ?? errorMsgAdminController
		);
	});
};

export const testGuardedAssetsCdnMethods = ({
	actor,
	errorMsgAdminController,
	errorMsgController
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	errorMsgAdminController: string;
	errorMsgController?: string;
}) => {
	it('should throw errors on list assets', async () => {
		const { list_assets } = actor();

		await expect(
			list_assets('#dapp', { matcher: [], order: [], owner: [], paginate: [] })
		).rejects.toThrow(errorMsgController ?? errorMsgAdminController);
	});
};

export const testCdnConfig = ({ actor }: { actor: () => Actor<SatelliteActor | ConsoleActor> }) => {
	it('should set and get config', async () => {
		const { set_storage_config, get_storage_config } = actor();

		const config: StorageConfig = {
			headers: [['*', [['cache-control', 'no-cache']]]],
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
};

export const testControlledCdnMethods = ({
	actor,
	pic,
	caller,
	canisterId,
	currentDate,
	expected_proposal_id = 1n,
	fullPaths = {
		assetsUpgrade: '/hello.html',
		segmentsDeployment: '/releases/satellite-v0.0.18.wasm.gz',
		segmentsVersion: '0.0.18',
		assetsCollection: '#dapp',
		segmentsCollection: '#releases'
	}
}: {
	actor: (params?: { requireController: boolean }) => Actor<SatelliteActor | ConsoleActor>;
	pic: () => PocketIc;
	caller: () => Identity;
	canisterId: () => Principal;
	currentDate: Date;
	expected_proposal_id?: bigint;
	fullPaths?: {
		assetsUpgrade: string;
		segmentsDeployment: string;
		segmentsVersion: string;
		assetsCollection: string;
		segmentsCollection: string;
	};
}) => {
	describe.each([
		{
			proposal_type: {
				AssetsUpgrade: {
					clear_existing_assets: toNullable()
				}
			} as ProposalType,
			collection: fullPaths.assetsCollection,
			full_path: fullPaths.assetsUpgrade,
			version: fullPaths.segmentsVersion,
			expected_proposal_id
		},
		{
			proposal_type: {
				SegmentsDeployment: {
					mission_control_version: [],
					orbiter: [],
					satellite_version: ['0.0.18']
				}
			} as ProposalType,
			collection: fullPaths.segmentsCollection,
			full_path: fullPaths.segmentsDeployment,
			description: (proposalId: bigint) =>
				`change=${proposalId};version=v${fullPaths.segmentsVersion}`,
			expected_proposal_id: expected_proposal_id + 2n // The proposal committed and the one we reject
		}
	])(
		'Proposal, upload and serve',
		({ proposal_type, collection, full_path, expected_proposal_id, description }) => {
			let sha256: [] | [Uint8Array | number[]];
			let proposalId: bigint;

			it('should init a proposal', async () => {
				const { init_proposal } = actor();

				const [id, proposal] = await init_proposal(proposal_type);

				proposalId = id;

				expect(proposalId).toEqual(expected_proposal_id);

				expect(proposal.status).toEqual({ Initialized: null });
				expect(fromNullable(proposal.sha256)).toBeUndefined();
				expect(fromNullable(proposal.executed_at)).toBeUndefined();
				expect(proposal.owner.toText()).toEqual(caller().getPrincipal().toText());
				expect(proposal.proposal_type).toEqual(proposal_type);
				expect(proposal.created_at).not.toBeUndefined();
				expect(proposal.created_at).toBeGreaterThan(0n);
				expect(proposal.updated_at).not.toBeUndefined();
				expect(proposal.updated_at).toBeGreaterThan(0n);
				expect(fromNullable(proposal.version) ?? 0n).toBeGreaterThan(0n);
			});

			it('should fail at uploading asset for unknown proposal', async () => {
				const { init_proposal_asset_upload } = actor();

				const unknownProposalId = proposalId + 1n;

				await expect(
					init_proposal_asset_upload(
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
				).rejects.toThrow(`${JUNO_CDN_STORAGE_ERROR_NO_PROPOSAL_FOUND} (${unknownProposalId})`);
			});

			const uploadProposalAsset = async (proposalId: bigint) => {
				const {
					upload_proposal_asset_chunk,
					init_proposal_asset_upload,
					commit_proposal_asset_upload
				} = actor();

				const file = await init_proposal_asset_upload(
					{
						collection,
						description: toNullable(description?.(proposalId)),
						encoding_type: [],
						full_path,
						name: 'hello.html',
						token: toNullable()
					},
					proposalId
				);

				const chunk = await upload_proposal_asset_chunk({
					batch_id: file.batch_id,
					content: arrayBufferToUint8Array(await mockBlob.arrayBuffer()),
					order_id: [0n]
				});

				await commit_proposal_asset_upload({
					batch_id: file.batch_id,
					chunk_ids: [chunk.chunk_id],
					headers: []
				});
			};

			it('should upload asset', async () => {
				await uploadProposalAsset(proposalId);

				const { http_request } = actor();

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
				const { submit_proposal } = actor();

				const unknownProposalId = proposalId + 1n;

				await expect(submit_proposal(unknownProposalId)).rejects.toThrow(
					JUNO_CDN_PROPOSALS_ERROR_CANNOT_SUBMIT
				);
			});

			it('should submit proposal', async () => {
				const { submit_proposal } = actor();

				// Advance time for updated_at
				await pic().advanceTime(100);

				const [_, proposal] = await submit_proposal(proposalId);

				expect(proposal.status).toEqual({ Open: null });
				expect(sha256ToBase64String(fromNullable(proposal.sha256) ?? [])).not.toBeUndefined();
				expect(fromNullable(proposal.executed_at)).toBeUndefined();
				expect(proposal.owner.toText()).toEqual(caller().getPrincipal().toText());
				expect(proposal.proposal_type).toEqual(proposal_type);
				expect(proposal.created_at).not.toBeUndefined();
				expect(proposal.created_at).toBeGreaterThan(0n);
				expect(proposal.updated_at).not.toBeUndefined();
				expect(proposal.updated_at).toBeGreaterThan(0n);
				expect(proposal.updated_at).toBeGreaterThan(proposal.created_at);
				expect(fromNullable(proposal.version) ?? 0n).toEqual(2n);

				// eslint-disable-next-line prefer-destructuring
				sha256 = proposal.sha256;
			});

			it('should still not serve asset', async () => {
				const { http_request } = actor();

				const { status_code } = await http_request({
					body: [],
					certificate_version: toNullable(),
					headers: [],
					method: 'GET',
					url: full_path
				});

				expect(status_code).toBe(404);
			});

			it('should fail at deleting assets for a proposal open', async () => {
				const { delete_proposal_assets } = actor({ requireController: true });

				await expect(
					delete_proposal_assets({
						proposal_ids: [proposalId]
					})
				).rejects.toThrow(`${JUNO_CDN_PROPOSALS_ERROR_CANNOT_DELETE_ASSETS_INVALID_STATUS} (Open)`);
			});

			it('should fail at submitting a proposal if already open', async () => {
				const { submit_proposal } = actor();

				await expect(submit_proposal(proposalId)).rejects.toThrow(
					`${JUNO_CDN_PROPOSALS_ERROR_CANNOT_SUBMIT_INVALID_STATUS} (Open)`
				);
			});

			it('should fail at rejecting a proposal if unknown', async () => {
				const { reject_proposal } = actor({ requireController: true });

				const unknownProposalId = proposalId + 1n;

				await expect(
					reject_proposal({
						sha256: Array.from({ length: 32 }).map((_, i) => i),
						proposal_id: proposalId + 1n
					})
				).rejects.toThrow(`${JUNO_CDN_PROPOSALS_ERROR_CANNOT_REJECT} (${unknownProposalId})`);
			});

			it('should fail at committing a proposal if unknown', async () => {
				const { commit_proposal } = actor({ requireController: true });

				const unknownProposalId = proposalId + 1n;

				await expect(
					commit_proposal({
						sha256: Array.from({ length: 32 }).map((_, i) => i),
						proposal_id: proposalId + 1n
					})
				).rejects.toThrow(`${JUNO_CDN_PROPOSALS_ERROR_CANNOT_COMMIT} (${unknownProposalId})`);
			});

			it('should fail at rejecting a proposal with incorrect sha256', async () => {
				const { reject_proposal } = actor({ requireController: true });

				const sha256 = Array.from({ length: 32 }).map((_, i) => i);

				await expect(
					reject_proposal({
						sha256,
						proposal_id: proposalId
					})
				).rejects.toThrow(
					`${JUNO_CDN_PROPOSALS_ERROR_INVALID_HASH} (${uint8ArrayToHexString(sha256)})`
				);
			});

			it('should fail at committing a proposal with incorrect sha256', async () => {
				const { commit_proposal } = actor({ requireController: true });

				const sha256 = Array.from({ length: 32 }).map((_, i) => i);

				await expect(
					commit_proposal({
						sha256,
						proposal_id: proposalId
					})
				).rejects.toThrow(
					`${JUNO_CDN_PROPOSALS_ERROR_INVALID_HASH} (${uint8ArrayToHexString(sha256)})`
				);
			});

			it('should not update proposal status', async () => {
				const { get_proposal } = actor();

				const proposal = fromNullable(await get_proposal(proposalId));

				assertNonNullish(proposal);

				expect(proposal.status).toEqual({ Open: null });
			});

			it('should commit proposal', async () => {
				const { commit_proposal } = actor({ requireController: true });

				await expect(
					commit_proposal({
						sha256: fromNullable(sha256)!,
						proposal_id: proposalId
					})
				).resolves.not.toThrow();
			});

			it('should have updated proposal to executed', async () => {
				const { get_proposal } = actor();

				const proposal = fromNullable(await get_proposal(proposalId));

				assertNonNullish(proposal);

				expect(proposal.status).toEqual({ Executed: null });
			});

			describe('Delete proposal assets', () => {
				it('should throw errors on delete unknown proposal', async () => {
					const { delete_proposal_assets } = actor({ requireController: true });

					await expect(delete_proposal_assets({ proposal_ids: [1000n] })).rejects.toThrow(
						JUNO_CDN_PROPOSALS_ERROR_CANNOT_DELETE_ASSETS
					);
				});

				it('should succeed at deleting proposal assets', async () => {
					const { delete_proposal_assets } = actor({ requireController: true });

					await expect(
						delete_proposal_assets({ proposal_ids: [proposalId] })
					).resolves.not.toThrow();
				});
			});

			it('should serve asset', async () => {
				const { http_request } = actor();

				await tick(pic());

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

				assertHeaders({
					headers
				});

				await assertCertification({
					canisterId: canisterId(),
					pic: pic(),
					request,
					response,
					currentDate
				});

				const decoder = new TextDecoder();

				expect(decoder.decode(body as Uint8Array<ArrayBufferLike>)).toEqual(mockHtml);
			});

			it('should list assets', async () => {
				const { list_assets } = actor({ requireController: true });

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

			describe('Reject', () => {
				let rejectProposalId: bigint;
				let rejectSha256: [] | [Uint8Array | number[]];

				beforeAll(async () => {
					const { init_proposal } = actor();

					const [id, _] = await init_proposal(proposal_type);

					rejectProposalId = id;

					await uploadProposalAsset(id);
				});

				it('should fail at rejecting committed proposal', async () => {
					const { reject_proposal } = actor({ requireController: true });

					await expect(
						reject_proposal({
							sha256: fromNullable(sha256)!,
							proposal_id: proposalId
						})
					).rejects.toThrow(`${JUNO_CDN_PROPOSALS_ERROR_CANNOT_REJECT_INVALID_STATUS} (Executed)`);
				});

				it('should fail at rejecting proposal not open', async () => {
					const { reject_proposal } = actor({ requireController: true });

					await expect(
						reject_proposal({
							sha256: fromNullable(sha256)!,
							proposal_id: rejectProposalId
						})
					).rejects.toThrow(
						`${JUNO_CDN_PROPOSALS_ERROR_CANNOT_REJECT_INVALID_STATUS} (Initialized)`
					);
				});

				it('should fail at rejecting proposal with invalid sha256', async () => {
					const { submit_proposal } = actor();

					const [__, { sha256: sha }] = await submit_proposal(rejectProposalId);

					rejectSha256 = sha;

					const { reject_proposal } = actor({ requireController: true });

					await expect(
						reject_proposal({
							sha256: fromNullable(sha256)!,
							proposal_id: rejectProposalId
						})
					).rejects.toThrow(
						`${JUNO_CDN_PROPOSALS_ERROR_INVALID_HASH} (${uint8ArrayToHexString(fromNullable(sha256) ?? [])})`
					);
				});

				it('should reject proposal', async () => {
					const { get_proposal } = actor();

					const { reject_proposal } = actor({ requireController: true });

					await expect(
						reject_proposal({
							sha256: fromNullable(rejectSha256)!,
							proposal_id: rejectProposalId
						})
					).resolves.not.toThrow();

					const proposal = fromNullable(await get_proposal(rejectProposalId));

					assertNonNullish(proposal);

					expect(proposal.status).toEqual({ Rejected: null });
				});

				it('should fail at rejecting proposal already rejected', async () => {
					const { reject_proposal } = actor({ requireController: true });

					await expect(
						reject_proposal({
							sha256: fromNullable(rejectSha256)!,
							proposal_id: rejectProposalId
						})
					).rejects.toThrow(`${JUNO_CDN_PROPOSALS_ERROR_CANNOT_REJECT_INVALID_STATUS} (Rejected)`);
				});
			});
		}
	);

	it('should clear assets with proposal', async () => {
		const { http_request, init_proposal, submit_proposal } = actor();

		const [proposalId, __] = await init_proposal({
			AssetsUpgrade: {
				clear_existing_assets: toNullable(true)
			}
		});

		await uploadFile({ proposalId, actor: actor() });

		const [_, proposal] = await submit_proposal(proposalId);

		const { commit_proposal } = actor({ requireController: true });

		await commit_proposal({
			sha256: fromNullable(proposal.sha256)!,
			proposal_id: proposalId
		});

		const { status_code } = await http_request({
			body: [],
			certificate_version: toNullable(),
			headers: [],
			method: 'GET',
			url: fullPaths.assetsUpgrade
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

	it('should still serve asset on #releases after #dapp has been cleared', async () => {
		const { http_request } = actor();

		const { status_code } = await http_request({
			body: [],
			certificate_version: toNullable(),
			headers: [],
			method: 'GET',
			url: fullPaths.segmentsDeployment
		});

		expect(status_code).toBe(200);
	});

	it('should mark proposal as failed', async () => {
		const { init_proposal, submit_proposal, get_proposal } = actor();

		const [proposalId, __] = await init_proposal({
			AssetsUpgrade: {
				clear_existing_assets: toNullable(false)
			}
		});

		// We do not upload any chunks and commit batch to make the proposal fail.

		const [_, { sha256 }] = await submit_proposal(proposalId);

		const { commit_proposal } = actor({ requireController: true });

		await expect(
			commit_proposal({
				sha256: fromNullable(sha256)!,
				proposal_id: proposalId
			})
		).rejects.toThrow(`${JUNO_CDN_PROPOSALS_ERROR_EMPTY_ASSETS} (${proposalId})`);

		const proposal = fromNullable(await get_proposal(proposalId));

		assertNonNullish(proposal);

		expect(proposal.status).toEqual({ Failed: null });
	});
};

export const testReleasesProposal = ({
	actor,
	invalidModuleNames = [
		'satellite.wasm.gz',
		'mission_control.wasm.gz',
		'orbiter.wasm.gz',
		'satellite.wasm',
		'mission_control.wasm',
		'orbiter.wasm',
		'satellite.txt',
		'mission_control.txt',
		'orbiter.txt'
	],
	validModuleFullPaths = [
		'/releases/satellite-v0.0.18.wasm.gz',
		'/releases/mission_control-v0.2.18.wasm.gz',
		'/releases/orbiter-v1.0.18.wasm.gz'
	],
	validCollection = '#releases',
	fullPathPrefix = '/releases'
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	invalidModuleNames?: string[];
	validModuleFullPaths?: string[];
	validCollection?: string;
	fullPathPrefix?: string;
}) => {
	describe('Releases assertions', () => {
		describe.each(invalidModuleNames)(`Assert upload invalid path %s`, (filename) => {
			it('should throw error if full path does not match pattern', async () => {
				const { init_proposal_asset_upload, init_proposal } = actor();

				const [proposalId, _] = await init_proposal({
					AssetsUpgrade: {
						clear_existing_assets: toNullable()
					}
				});

				const fullPath = `${fullPathPrefix}/${filename}`;

				await expect(
					init_proposal_asset_upload(
						{
							collection: validCollection,
							description: toNullable(),
							encoding_type: [],
							full_path: fullPath,
							name: filename,
							token: toNullable()
						},
						proposalId
					)
				).rejects.toThrow(`${JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH} (${fullPath}`);
			});
		});

		describe.each(validModuleFullPaths)('Asset requires description', (fullPath) => {
			it('should throw error if description is missing', async () => {
				const { init_proposal_asset_upload, init_proposal } = actor();

				const [proposalId, _] = await init_proposal({
					AssetsUpgrade: {
						clear_existing_assets: toNullable()
					}
				});

				await expect(
					init_proposal_asset_upload(
						{
							collection: validCollection,
							description: toNullable(),
							encoding_type: [],
							full_path: fullPath,
							name: fullPath,
							token: toNullable()
						},
						proposalId
					)
				).rejects.toThrow(JUNO_CDN_STORAGE_ERROR_MISSING_RELEASES_DESCRIPTION);
			});

			it('should throw error if description is using an invalid pattern', async () => {
				const { init_proposal_asset_upload, init_proposal } = actor();

				const [proposalId, _] = await init_proposal({
					AssetsUpgrade: {
						clear_existing_assets: toNullable()
					}
				});

				await expect(
					init_proposal_asset_upload(
						{
							collection: validCollection,
							description: toNullable('test'),
							encoding_type: [],
							full_path: fullPath,
							name: fullPath,
							token: toNullable()
						},
						proposalId
					)
				).rejects.toThrow(`${JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_DESCRIPTION} (test)`);
			});
		});

		describe.each(validModuleFullPaths)(`Assert upload value path %s`, (fullPath) => {
			it('should throw error if collection is #dapp', async () => {
				const { init_proposal_asset_upload, init_proposal } = actor();

				const [proposalId, _] = await init_proposal({
					AssetsUpgrade: {
						clear_existing_assets: toNullable()
					}
				});

				await expect(
					init_proposal_asset_upload(
						{
							collection: '#dapp',
							description: toNullable(),
							encoding_type: [],
							full_path: fullPath,
							name: fullPath,
							token: toNullable()
						},
						proposalId
					)
				).rejects.toThrow(`${JUNO_CDN_STORAGE_ERROR_INVALID_COLLECTION} (${fullPath} - #dapp)`);
			});
		});
	});
};

export const testCdnStorageSettings = ({
	actor,
	pic
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	pic: () => PocketIc;
}) => {
	it('should serve with content encoding', async () => {
		const {
			init_proposal,
			http_request,
			commit_proposal,
			submit_proposal,
			commit_proposal_asset_upload,
			upload_proposal_asset_chunk,
			init_proposal_asset_upload
		} = actor();

		const [proposalId, __] = await init_proposal({
			AssetsUpgrade: {
				clear_existing_assets: toNullable()
			}
		});

		const upload = async (gzip: boolean) => {
			const file = await init_proposal_asset_upload(
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

			const chunk = await upload_proposal_asset_chunk({
				batch_id: file.batch_id,
				content: arrayBufferToUint8Array(await blob.arrayBuffer()),
				order_id: [0n]
			});

			await commit_proposal_asset_upload({
				batch_id: file.batch_id,
				chunk_ids: [chunk.chunk_id],
				headers: []
			});
		};

		await upload(true);
		await upload(false);

		// Advance time for updated_at
		await pic().advanceTime(100);

		const [_, proposal] = await submit_proposal(proposalId);

		await commit_proposal({
			sha256: fromNullable(proposal.sha256)!,
			proposal_id: proposalId
		});

		const { headers } = await http_request({
			body: [],
			certificate_version: toNullable(),
			headers: [['accept-encoding', 'gzip, deflate, br']],
			method: 'GET',
			url: '/index.js'
		});

		expect(
			headers.find(([key, value]) => key === 'content-encoding' && value === 'gzip')
		).not.toBeUndefined();
	});
};

export const testCdnGetProposal = ({
	actor,
	owner,
	proposalId = 1n
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	owner: () => Identity;
	proposalId?: bigint;
}) => {
	it('should get proposal', async () => {
		const { get_proposal } = actor();

		const proposal = fromNullable(await get_proposal(proposalId));

		assertNonNullish(proposal);

		expect(proposal.status).toEqual({ Executed: null });
		expect(sha256ToBase64String(fromNullable(proposal.sha256) ?? [])).not.toBeUndefined();
		expect(fromNullable(proposal.executed_at)).not.toBeUndefined();
		expect(proposal.owner.toText()).toEqual(owner().getPrincipal().toText());
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
};

export const testCdnCountProposals = ({
	actor,
	proposalsLength = 25n
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	proposalsLength?: bigint;
}) => {
	it('should count all proposals', async () => {
		const { count_proposals } = actor();

		await expect(count_proposals()).resolves.toEqual(proposalsLength);
	});
};

export const testCdnListProposals = ({
	actor,
	proposalsLength = 25n
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	proposalsLength?: bigint;
}) => {
	describe('Asc', () => {
		it('should list all proposals', async () => {
			const { list_proposals } = actor();

			const { items, items_length, matches_length } = await list_proposals(mockListProposalsParams);

			expect(items).toHaveLength(Number(proposalsLength));
			expect(items_length).toEqual(proposalsLength);
			expect(matches_length).toEqual(proposalsLength);
		});

		it('should list start after', async () => {
			const { list_proposals } = actor();

			const startAfter = 5n;

			const { items, items_length, matches_length } = await list_proposals({
				...mockListProposalsParams,
				paginate: toNullable({
					start_after: toNullable(startAfter),
					limit: toNullable()
				})
			});

			expect(items).toHaveLength(Number(proposalsLength - startAfter));
			expect(items_length).toEqual(proposalsLength - startAfter);
			expect(matches_length).toEqual(proposalsLength - startAfter);

			expect(items[0][0].proposal_id).toEqual(startAfter + 1n);
		});

		it('should list limit', async () => {
			const { list_proposals } = actor();

			const limit = 10n;

			const { items, items_length, matches_length } = await list_proposals({
				...mockListProposalsParams,
				paginate: toNullable({
					start_after: toNullable(),
					limit: toNullable(limit)
				})
			});

			expect(items).toHaveLength(Number(limit));
			expect(items_length).toEqual(limit);
			expect(matches_length).toEqual(limit);

			expect(items[0][0].proposal_id).toEqual(1n);
			expect(items[items.length - 1][0].proposal_id).toEqual(limit);
		});

		it('should list start after and limit', async () => {
			const { list_proposals } = actor();

			const startAfter = 5n;
			const limit = 10n;

			const { items, items_length, matches_length } = await list_proposals({
				...mockListProposalsParams,
				paginate: toNullable({
					start_after: toNullable(startAfter),
					limit: toNullable(limit)
				})
			});

			expect(items).toHaveLength(Number(limit));
			expect(items_length).toEqual(limit);
			expect(matches_length).toEqual(limit);

			expect(items[0][0].proposal_id).toEqual(startAfter + 1n);
			expect(items[items.length - 1][0].proposal_id).toEqual(limit + startAfter);
		});

		it('should list less limit if length is reached', async () => {
			const { list_proposals } = actor();

			const length = 4n;
			const startAfter = proposalsLength - length;
			const limit = 10n;

			const { items, items_length, matches_length } = await list_proposals({
				...mockListProposalsParams,
				paginate: toNullable({
					start_after: toNullable(startAfter),
					limit: toNullable(limit)
				})
			});

			expect(items).toHaveLength(Number(length));
			expect(items_length).toEqual(length);
			expect(matches_length).toEqual(length);
		});
	});

	describe('Desc', () => {
		const descListProposalsParams = {
			...mockListProposalsParams,
			order: toNullable({
				desc: true
			})
		};

		it('should list all proposals', async () => {
			const { list_proposals } = actor();

			const { items, items_length, matches_length } = await list_proposals(descListProposalsParams);

			expect(items).toHaveLength(Number(proposalsLength));
			expect(items_length).toEqual(proposalsLength);
			expect(matches_length).toEqual(proposalsLength);
		});

		it('should list start after', async () => {
			const { list_proposals } = actor();

			const startAfter = 5n;

			const { items, items_length, matches_length } = await list_proposals({
				...descListProposalsParams,
				paginate: toNullable({
					start_after: toNullable(startAfter),
					limit: toNullable()
				})
			});

			expect(items).toHaveLength(Number(startAfter - 1n));
			expect(items_length).toEqual(startAfter - 1n);
			expect(matches_length).toEqual(startAfter - 1n);

			expect(items[0][0].proposal_id).toEqual(startAfter - 1n);
		});

		it('should list limit', async () => {
			const { list_proposals } = actor();

			const limit = 10n;

			const { items, items_length, matches_length } = await list_proposals({
				...descListProposalsParams,
				paginate: toNullable({
					start_after: toNullable(),
					limit: toNullable(limit)
				})
			});

			expect(items).toHaveLength(Number(limit));
			expect(items_length).toEqual(limit);
			expect(matches_length).toEqual(limit);

			expect(items[0][0].proposal_id).toEqual(proposalsLength);
			expect(items[items.length - 1][0].proposal_id).toEqual(proposalsLength + 1n - limit);
		});

		it('should list start after and limit', async () => {
			const { list_proposals } = actor();

			const startAfter = 15n;
			const limit = 10n;

			const { items, items_length, matches_length } = await list_proposals({
				...descListProposalsParams,
				paginate: toNullable({
					start_after: toNullable(startAfter),
					limit: toNullable(limit)
				})
			});

			expect(items).toHaveLength(Number(limit));
			expect(items_length).toEqual(limit);
			expect(matches_length).toEqual(limit);

			expect(items[0][0].proposal_id).toEqual(startAfter - 1n);
			expect(items[items.length - 1][0].proposal_id).toEqual(startAfter - limit);
		});

		it('should list less limit if length is reached', async () => {
			const { list_proposals } = actor();

			const length = 4n;
			const startAfter = 1n + length;
			const limit = 10n;

			const { items, items_length, matches_length } = await list_proposals({
				...descListProposalsParams,
				paginate: toNullable({
					start_after: toNullable(startAfter),
					limit: toNullable(limit)
				})
			});

			expect(items).toHaveLength(Number(length));
			expect(items_length).toEqual(length);
			expect(matches_length).toEqual(length);
		});
	});
};

/* eslint-enable */
