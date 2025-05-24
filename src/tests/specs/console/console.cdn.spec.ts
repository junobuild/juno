import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { arrayBufferToUint8Array, fromNullable, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from '../../constants/console-tests.constants';
import {
	testCdnConfig,
	testCdnGetProposal,
	testControlledCdnMethods,
	testGuardedAssetsCdnMethods,
	testNotAllowedCdnMethods
} from '../../utils/cdn-assertions-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Cdn', () => {
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

	describe('Anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testNotAllowedCdnMethods({ actor: () => actor, errorMsgAdminController: CONTROLLER_ERROR_MSG });

		testGuardedAssetsCdnMethods({
			actor: () => actor,
			errorMsgAdminController: CONTROLLER_ERROR_MSG
		});
	});

	describe('Some identity', () => {
		beforeAll(() => {
			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		testNotAllowedCdnMethods({ actor: () => actor, errorMsgAdminController: CONTROLLER_ERROR_MSG });

		testGuardedAssetsCdnMethods({
			actor: () => actor,
			errorMsgAdminController: CONTROLLER_ERROR_MSG
		});
	});

	describe('Admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		testCdnConfig({
			actor: () => actor
		});

		testControlledCdnMethods({
			actor: () => actor,
			currentDate,
			canisterId: () => canisterId,
			caller: () => controller,
			pic: () => pic
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
					const { init_proposal_asset_upload, init_proposal } = actor;

					const [proposalId, _] = await init_proposal({
						AssetsUpgrade: {
							clear_existing_assets: toNullable()
						}
					});

					await expect(
						init_proposal_asset_upload(
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
				commit_proposal_asset_upload,
				upload_proposal_asset_chunk,
				init_proposal_asset_upload
			} = actor;

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

	describe('anonymous (again)', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testCdnGetProposal({
			actor: () => actor,
			owner: () => controller
		});
	});
});
