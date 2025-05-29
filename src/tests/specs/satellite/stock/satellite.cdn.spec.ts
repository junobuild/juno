import type { _SERVICE as SatelliteActor, SetRule } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import {
	JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
	JUNO_AUTH_ERROR_NOT_CONTROLLER,
	JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER,
	JUNO_STORAGE_ERROR_UPLOAD_PATH_COLLECTION_PREFIX
} from '@junobuild/errors';
import { beforeAll, describe, expect, inject } from 'vitest';
import { mockListProposalsParams } from '../../../mocks/list.mocks';
import {
	testCdnConfig,
	testCdnCountProposals,
	testCdnGetProposal,
	testCdnListProposals,
	testCdnStorageSettings,
	testControlledCdnMethods,
	testNotAllowedCdnMethods,
	testReleasesProposal
} from '../../../utils/cdn-assertions-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Cdn', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();
	const controllerReadWrite = Ed25519KeyIdentity.generate();
	const controllerSubmit = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		canisterId = cId;

		// We do not want the index.html as redirect for the test suite.
		const { del_assets } = actor;
		await del_assets('#dapp');
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const testNotAllowedCdnMethodsInSatellite = ({
		actor,
		errorMsg
	}: {
		actor: () => Actor<SatelliteActor>;
		errorMsg: string;
	}) => {
		it('should throw errors on get proposal', async () => {
			const { get_proposal } = actor();

			await expect(get_proposal(1n)).rejects.toThrow(errorMsg);
		});

		it('should throw errors on lists proposals', async () => {
			const { list_proposals } = actor();

			await expect(list_proposals(mockListProposalsParams)).rejects.toThrow(errorMsg);
		});

		it('should throw errors on count proposals', async () => {
			const { count_proposals } = actor();

			await expect(count_proposals()).rejects.toThrow(errorMsg);
		});
	};

	describe('Anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testNotAllowedCdnMethods({
			actor: () => actor,
			errorMsgAdminController: JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
			errorMsgWriteController: JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER,
			errorMsgController: JUNO_AUTH_ERROR_NOT_CONTROLLER
		});

		testNotAllowedCdnMethodsInSatellite({
			actor: () => actor,
			errorMsg: JUNO_AUTH_ERROR_NOT_CONTROLLER
		});
	});

	describe('Some identity', () => {
		beforeAll(() => {
			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		testNotAllowedCdnMethods({
			actor: () => actor,
			errorMsgAdminController: JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
			errorMsgWriteController: JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER,
			errorMsgController: JUNO_AUTH_ERROR_NOT_CONTROLLER
		});

		testNotAllowedCdnMethodsInSatellite({
			actor: () => actor,
			errorMsg: JUNO_AUTH_ERROR_NOT_CONTROLLER
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
			pic: () => pic,
			fullPaths: {
				assetsUpgrade: '/hello.html',
				segmentsDeployment: '/_juno/releases/satellite-v0.0.18.wasm.gz',
				assetsCollection: '#dapp',
				segmentsCollection: '#_juno'
			}
		});

		testCdnGetProposal({
			actor: () => actor,
			owner: () => controller
		});
	});

	describe('Read+write controller', () => {
		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					scope: { Write: null },
					metadata: [],
					expires_at: []
				},
				controllers: [controllerReadWrite.getPrincipal()]
			});

			actor.setIdentity(controllerReadWrite);
		});

		beforeEach(() => {
			actor.setIdentity(controllerReadWrite);
		});

		testControlledCdnMethods({
			actor: () => actor,
			currentDate,
			canisterId: () => canisterId,
			caller: () => controllerReadWrite,
			pic: () => pic,
			expected_proposal_id: 5n,
			fullPaths: {
				assetsUpgrade: '/world.html',
				segmentsDeployment: '/_juno/releases/satellite-v0.1.1.wasm.gz',
				assetsCollection: '#dapp',
				segmentsCollection: '#_juno'
			}
		});

		testCdnGetProposal({
			actor: () => actor,
			owner: () => controllerReadWrite,
			proposalId: 5n
		});

		testCdnGetProposal({
			actor: () => actor,
			owner: () => controller
		});
	});

	describe('Admin for releases', () => {
		const INVALID_COLLECTION = 'test_invalid_collection_for_release';

		const validModuleFullPaths = [
			'/_juno/releases/satellite-v0.0.18.wasm.gz',
			'/_juno/releases/satellite.wasm.gz'
		];

		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_rule } = actor;

			const setRule: SetRule = {
				memory: toNullable({ Heap: null }),
				max_size: toNullable(),
				max_capacity: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Managed: null },
				version: toNullable(),
				rate_config: toNullable(),
				max_changes_per_user: toNullable()
			};

			await set_rule({ Storage: null }, INVALID_COLLECTION, setRule);
		});

		testCdnConfig({
			actor: () => actor
		});

		testReleasesProposal({
			actor: () => actor,
			invalidModuleNames: [
				'mission_control.wasm.gz',
				'orbiter.wasm.gz',
				'mission_control-v0.1.1.wasm.gz',
				'orbiter-v0.0.1.wasm.gz',
				'satellite.wasm',
				'mission_control.wasm',
				'orbiter.wasm',
				'satellite.txt',
				'mission_control.txt',
				'orbiter.txt'
			],
			validModuleFullPaths,
			validCollection: '#_juno',
			fullPathPrefix: '/_juno/releases'
		});

		describe.each(validModuleFullPaths)(`Assert upload value path start with %s`, (fullPath) => {
			it('should throw error if full_path is not prefixed with collection', async () => {
				const { init_proposal_asset_upload, init_proposal } = actor;

				const [proposalId, _] = await init_proposal({
					AssetsUpgrade: {
						clear_existing_assets: toNullable()
					}
				});

				await expect(
					init_proposal_asset_upload(
						{
							collection: INVALID_COLLECTION,
							description: toNullable(),
							encoding_type: [],
							full_path: fullPath,
							name: fullPath,
							token: toNullable()
						},
						proposalId
					)
				).rejects.toThrow(`${JUNO_STORAGE_ERROR_UPLOAD_PATH_COLLECTION_PREFIX}`);
			});
		});

		testCdnStorageSettings({
			actor: () => actor,
			pic: () => pic
		});
	});

	describe('Submit controller', () => {
		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					scope: { Submit: null },
					metadata: [],
					expires_at: []
				},
				controllers: [controllerSubmit.getPrincipal()]
			});

			actor.setIdentity(controllerSubmit);
		});

		beforeEach(() => {
			actor.setIdentity(controllerSubmit);
		});

		describe('Admin commit', () => {
			testControlledCdnMethods({
				actor: (params) => {
					if (params?.requireController === true) {
						actor.setIdentity(controller);
					} else {
						actor.setIdentity(controllerSubmit);
					}

					return actor;
				},
				currentDate,
				canisterId: () => canisterId,
				caller: () => controllerSubmit,
				pic: () => pic,
				expected_proposal_id: 24n,
				fullPaths: {
					assetsUpgrade: '/magic.html',
					segmentsDeployment: '/_juno/releases/satellite-v2.1.1.wasm.gz',
					assetsCollection: '#dapp',
					segmentsCollection: '#_juno'
				}
			});

			testCdnGetProposal({
				actor: () => actor,
				owner: () => controllerSubmit,
				proposalId: 24n
			});

			testCdnGetProposal({
				actor: () => actor,
				owner: () => controllerReadWrite,
				proposalId: 5n
			});

			testCdnGetProposal({
				actor: () => actor,
				owner: () => controller
			});

			testCdnGetProposal({
				actor: () => {
					actor.setIdentity(controllerReadWrite);
					return actor;
				},
				owner: () => controllerSubmit,
				proposalId: 24n
			});

			testCdnGetProposal({
				actor: () => {
					actor.setIdentity(controller);
					return actor;
				},
				owner: () => controllerSubmit,
				proposalId: 24n
			});
		});

		describe('Write commit', () => {
			testControlledCdnMethods({
				actor: (params) => {
					if (params?.requireController === true) {
						actor.setIdentity(controllerReadWrite);
					} else {
						actor.setIdentity(controllerSubmit);
					}

					return actor;
				},
				currentDate,
				canisterId: () => canisterId,
				caller: () => controllerSubmit,
				pic: () => pic,
				expected_proposal_id: 28n,
				fullPaths: {
					assetsUpgrade: '/book.html',
					segmentsDeployment: '/_juno/releases/satellite-v3.1.1.wasm.gz',
					assetsCollection: '#dapp',
					segmentsCollection: '#_juno'
				}
			});

			testCdnGetProposal({
				actor: () => actor,
				owner: () => controllerSubmit,
				proposalId: 28n
			});

			testCdnGetProposal({
				actor: () => actor,
				owner: () => controllerReadWrite,
				proposalId: 5n
			});

			testCdnGetProposal({
				actor: () => actor,
				owner: () => controller
			});

			testCdnGetProposal({
				actor: () => {
					actor.setIdentity(controllerReadWrite);
					return actor;
				},
				owner: () => controllerSubmit,
				proposalId: 28n
			});

			testCdnGetProposal({
				actor: () => {
					actor.setIdentity(controller);
					return actor;
				},
				owner: () => controllerSubmit,
				proposalId: 28n
			});
		});

		it('should throw errors at committing a proposal', async () => {
			const { commit_proposal } = actor;

			await expect(
				commit_proposal({
					sha256: Array.from({ length: 32 }).map((_, i) => i),
					proposal_id: 28n
				})
			).rejects.toThrow(JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER);
		});

		it('should throw errors on delete proposal assets', async () => {
			const { delete_proposal_assets } = actor;

			await expect(delete_proposal_assets({ proposal_ids: [1n] })).rejects.toThrow(
				JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER
			);
		});
	});

	describe('List', () => {
		beforeAll(async () => {
			actor.setIdentity(controller);
		});

		testCdnListProposals({
			actor: () => actor,
			proposalsLength: 31n
		});

		testCdnCountProposals({
			actor: () => actor,
			proposalsLength: 31n
		});
	});
});
