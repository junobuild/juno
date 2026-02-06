import { idlFactorySatellite, type SatelliteActor } from '$declarations';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { type Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import {
	JUNO_AUTH_ERROR_NOT_CONTROLLER,
	JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER
} from '@junobuild/errors';
import { inject } from 'vitest';
import { CONTROLLER_METADATA } from '../../../../constants/controller-tests.constants';
import { mockListProposalsParams } from '../../../../mocks/list.mocks';
import { tick } from '../../../../utils/pic-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../../utils/setup-tests.utils';

describe('Satellite > Controllers > Guards', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const TEST_COLLECTION = 'test';

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorySatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe.each([
		{ title: 'write', scope: { Write: null } },
		{ title: 'submit', scope: { Submit: null } }
	])('Caller is valid controller $title', ({ scope }) => {
		const testController = Ed25519KeyIdentity.generate();

		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					...CONTROLLER_METADATA,
					scope,
					expires_at: [toBigIntNanoSeconds(new Date((await pic.getTime()) + 10))]
				},
				controllers: [testController.getPrincipal()]
			});

			actor.setIdentity(testController);

			await pic.advanceTime(100);
			await tick(pic);
		});

		it('should throw on get_proposal', async () => {
			const { get_proposal } = actor;

			await expect(get_proposal(123n)).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});

		it('should throw on list_proposals', async () => {
			const { list_proposals } = actor;

			await expect(list_proposals(mockListProposalsParams)).rejects.toThrowError(
				JUNO_AUTH_ERROR_NOT_CONTROLLER
			);
		});

		it('should throw on count_proposals', async () => {
			const { count_proposals } = actor;

			await expect(count_proposals()).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});

		it('should throw on init_proposal', async () => {
			const { init_proposal } = actor;

			await expect(
				init_proposal({
					AssetsUpgrade: {
						clear_existing_assets: toNullable()
					}
				})
			).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});

		it('should throw on submit_proposal', async () => {
			const { submit_proposal } = actor;

			await expect(submit_proposal(123n)).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});

		it('should throw on init_proposal_asset_upload', async () => {
			const { init_proposal_asset_upload } = actor;

			await expect(
				init_proposal_asset_upload(
					{
						collection: TEST_COLLECTION,
						description: toNullable(),
						encoding_type: [],
						full_path: '/test',
						name: '/test',
						token: toNullable()
					},
					123n
				)
			).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});

		it('should throw on init_proposal_many_assets_upload', async () => {
			const { init_proposal_many_assets_upload } = actor;

			await expect(
				init_proposal_many_assets_upload(
					[
						{
							collection: TEST_COLLECTION,
							description: toNullable(),
							encoding_type: [],
							full_path: '/test',
							name: '/test',
							token: toNullable()
						}
					],
					123n
				)
			).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});

		it('should throw on upload_proposal_asset_chunk', async () => {
			const { upload_proposal_asset_chunk } = actor;

			await expect(
				upload_proposal_asset_chunk({
					batch_id: 123n,
					content: Uint8Array.from([1, 2]),
					order_id: [0n]
				})
			).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});

		it('should throw on commit_proposal_asset_upload', async () => {
			const { commit_proposal_asset_upload } = actor;

			await expect(
				commit_proposal_asset_upload({
					batch_id: 12n,
					chunk_ids: [1n],
					headers: []
				})
			).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});

		it('should throw on commit_proposal_many_assets_upload', async () => {
			const { commit_proposal_many_assets_upload } = actor;

			await expect(
				commit_proposal_many_assets_upload([
					{
						batch_id: 12n,
						chunk_ids: [1n],
						headers: []
					}
				])
			).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});

		it('should throw on memory_size', async () => {
			const { memory_size } = actor;

			await expect(memory_size()).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});
	});

	describe('Caller with write', () => {
		const testController = Ed25519KeyIdentity.generate();

		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					...CONTROLLER_METADATA,
					scope: { Write: null },
					expires_at: [toBigIntNanoSeconds(new Date((await pic.getTime()) + 10))]
				},
				controllers: [testController.getPrincipal()]
			});

			actor.setIdentity(testController);

			await pic.advanceTime(100);
		});

		it('should throw on del_docs', async () => {
			const { del_docs } = actor;

			await expect(del_docs(TEST_COLLECTION)).rejects.toThrowError(
				JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER
			);
		});

		it('should throw on count_collection_docs', async () => {
			const { count_collection_docs } = actor;

			await expect(count_collection_docs(TEST_COLLECTION)).rejects.toThrowError(
				JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER
			);
		});

		it('should throw on reject_proposal', async () => {
			const { reject_proposal } = actor;

			await expect(
				reject_proposal({
					proposal_id: 1123n,
					sha256: Uint8Array.from([1, 2])
				})
			).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER);
		});

		it('should throw on commit_proposal', async () => {
			const { commit_proposal } = actor;

			await expect(
				commit_proposal({
					proposal_id: 1123n,
					sha256: Uint8Array.from([1, 2])
				})
			).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER);
		});

		it('should throw on delete_proposal_assets', async () => {
			const { delete_proposal_assets } = actor;

			await expect(
				delete_proposal_assets({
					proposal_ids: [1n]
				})
			).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER);
		});

		it('should throw on del_assets', async () => {
			const { del_assets } = actor;

			await expect(del_assets(TEST_COLLECTION)).rejects.toThrowError(
				JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER
			);
		});

		it('should throw on count_collection_assets', async () => {
			const { count_collection_assets } = actor;

			await expect(count_collection_assets(TEST_COLLECTION)).rejects.toThrowError(
				JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER
			);
		});
	});
});
