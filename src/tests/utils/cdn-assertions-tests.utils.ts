import type {
	CommitProposal,
	_SERVICE as ConsoleActor,
	HttpRequest,
	InitAssetKey,
	ProposalType,
	UploadChunk
} from '$declarations/console/console.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
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
import { describe, expect } from 'vitest';
import { mockBlob, mockHtml } from '../mocks/storage.mocks';
import { uploadFile } from './cdn-tests.utils';
import { assertCertification } from './certification-tests.utils';
import { sha256ToBase64String } from './crypto-tests.utils';
import { tick } from './pic-tests.utils';

/* eslint-disable vitest/require-top-level-describe */

export const testNotAllowedCdnMethods = ({
	actor,
	errorMsgAdminController,
	errorMsgController
}: {
	actor: () => Actor<SatelliteActor | MissionControlActor | ConsoleActor>;
	errorMsgAdminController: string;
	errorMsgController?: string;
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
			errorMsgController ?? errorMsgAdminController
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
			errorMsgController ?? errorMsgAdminController
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
			errorMsgController ?? errorMsgAdminController
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
			errorMsgAdminController
		);
	});

	it('should throw errors on init proposal', async () => {
		const { init_proposal } = actor();

		await expect(init_proposal({ AssetsUpgrade: { clear_existing_assets: [] } })).rejects.toThrow(
			errorMsgController ?? errorMsgAdminController
		);
	});

	it('should throw errors on submit proposal', async () => {
		const { submit_proposal } = actor();

		await expect(submit_proposal(123n)).rejects.toThrow(
			errorMsgController ?? errorMsgAdminController
		);
	});

	it('should throw errors on commit proposal', async () => {
		const { commit_proposal } = actor();

		const commit: CommitProposal = {
			sha256: [1, 2, 3],
			proposal_id: 123n
		};

		await expect(commit_proposal(commit)).rejects.toThrow(errorMsgAdminController);
	});
};

export const testGuardedAssetsCdnMethods = ({
	actor,
	errorMsgAdminController,
	errorMsgController
}: {
	actor: () => Actor<SatelliteActor | MissionControlActor | ConsoleActor>;
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

export const testCdnConfig = ({
	actor
}: {
	actor: () => Actor<SatelliteActor | MissionControlActor | ConsoleActor>;
}) => {
	it('should set and get config', async () => {
		const { set_storage_config, get_storage_config } = actor();

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
		segmentsDeployment: '/releases/satellite-v0.0.18.wasm.gz'
	}
}: {
	actor: (params?: {
		requireController: boolean;
	}) => Actor<SatelliteActor | MissionControlActor | ConsoleActor>;
	pic: () => PocketIc;
	caller: () => Identity;
	canisterId: () => Principal;
	currentDate: Date;
	expected_proposal_id?: bigint;
	fullPaths?: { assetsUpgrade: string; segmentsDeployment: string };
}) => {
	describe.each([
		{
			proposal_type: {
				AssetsUpgrade: {
					clear_existing_assets: toNullable()
				}
			} as ProposalType,
			collection: '#dapp',
			full_path: fullPaths.assetsUpgrade,
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
			collection: '#releases',
			full_path: fullPaths.segmentsDeployment,
			expected_proposal_id: expected_proposal_id + 1n
		}
	])(
		'Proposal, upload and serve',
		({ proposal_type, collection, full_path, expected_proposal_id }) => {
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
				).rejects.toThrow(`No proposal found for ${unknownProposalId}`);
			});

			it('should upload asset', async () => {
				const {
					http_request,
					commit_proposal_asset_upload,
					upload_proposal_asset_chunk,
					init_proposal_asset_upload
				} = actor();

				const file = await init_proposal_asset_upload(
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
					'juno.error.proposals.cannot_submit'
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

			it('should fail at submitting a proposal if already open', async () => {
				const { submit_proposal } = actor();

				await expect(submit_proposal(proposalId)).rejects.toThrow(
					'juno.error.proposals.cannot_submit_invalid_status (Open)'
				);
			});

			it('should fail at committing a proposal if unknown', async () => {
				const { commit_proposal } = actor({ requireController: true });

				const unknownProposalId = proposalId + 1n;

				await expect(
					commit_proposal({
						sha256: Array.from({ length: 32 }).map((_, i) => i),
						proposal_id: proposalId + 1n
					})
				).rejects.toThrow(`juno.error.proposals.cannot_commit (${unknownProposalId})`);
			});

			it('should fail at committing a proposal with incorrect sha256', async () => {
				const { commit_proposal } = actor({ requireController: true });

				const sha256 = Array.from({ length: 32 }).map((_, i) => i);

				await expect(
					commit_proposal({
						sha256,
						proposal_id: proposalId
					})
				).rejects.toThrow(`juno.error.proposals.invalid_hash (${uint8ArrayToHexString(sha256)})`);
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
				const { list_assets } = actor();

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

	it('should still serve asset after #dApp has been cleared', async () => {
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
		).rejects.toThrow(`juno.error.proposals.empty_assets (${proposalId})`);

		const proposal = fromNullable(await get_proposal(proposalId));

		assertNonNullish(proposal);

		expect(proposal.status).toEqual({ Failed: null });
	});
};

export const testCdnGetProposal = ({
	actor,
	owner,
	proposalId = 1n
}: {
	actor: () => Actor<SatelliteActor | MissionControlActor | ConsoleActor>;
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

/* eslint-enable */
