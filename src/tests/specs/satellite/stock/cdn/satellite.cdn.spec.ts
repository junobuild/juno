import type { SatelliteActor, SatelliteDid } from '$declarations';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import {
	JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
	JUNO_AUTH_ERROR_NOT_CONTROLLER,
	JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER,
	JUNO_STORAGE_ERROR_UPLOAD_PATH_COLLECTION_PREFIX
} from '@junobuild/errors';
import { MEMORIES } from '../../../../constants/satellite-tests.constants';
import { mockListProposalsParams } from '../../../../mocks/list.mocks';
import {
	testCdnConfig,
	testCdnCountProposals,
	testCdnGetProposal,
	testCdnListProposals,
	testCdnStorageSettings,
	testControlledCdnMethods,
	testNotAllowedCdnMethods,
	testReleasesProposal
} from '../../../../utils/cdn-assertions-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';

describe.each(MEMORIES)('Satellite > Cdn > $title', ({ memory }) => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	const controllerReadWrite = Ed25519KeyIdentity.generate();
	const controllerSubmit = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		const {
			actor: a,
			canisterId: c,
			pic: p,
			controller: cO
		} = await setupSatelliteStock({
			withIndexHtml: false,
			memory
		});

		pic = p;
		actor = a;
		controller = cO;
		canisterId = c;

		actor.setIdentity(controller);
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
				segmentsVersion: '0.0.18',
				assetsCollection: '#dapp',
				segmentsCollection: '#_juno/releases'
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
			expected_proposal_id: 7n,
			fullPaths: {
				assetsUpgrade: '/world.html',
				segmentsDeployment: '/_juno/releases/satellite-v0.1.1.wasm.gz',
				segmentsVersion: '0.1.1',
				assetsCollection: '#dapp',
				segmentsCollection: '#_juno/releases'
			}
		});

		testCdnGetProposal({
			actor: () => actor,
			owner: () => controllerReadWrite,
			proposalId: 7n
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

			const setRule: SatelliteDid.SetRule = {
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
			actor: () => actor,
			configBaseVersion: 1n
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
			validCollection: '#_juno/releases',
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
				expected_proposal_id: 32n,
				fullPaths: {
					assetsUpgrade: '/magic.html',
					segmentsDeployment: '/_juno/releases/satellite-v2.1.1.wasm.gz',
					segmentsVersion: '2.1.1',
					assetsCollection: '#dapp',
					segmentsCollection: '#_juno/releases'
				}
			});

			testCdnGetProposal({
				actor: () => actor,
				owner: () => controllerSubmit,
				proposalId: 32n
			});

			testCdnGetProposal({
				actor: () => actor,
				owner: () => controllerReadWrite,
				proposalId: 7n
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
				proposalId: 32n
			});

			testCdnGetProposal({
				actor: () => {
					actor.setIdentity(controller);
					return actor;
				},
				owner: () => controllerSubmit,
				proposalId: 32n
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
				expected_proposal_id: 38n,
				fullPaths: {
					assetsUpgrade: '/book.html',
					segmentsDeployment: '/_juno/releases/satellite-v3.1.1.wasm.gz',
					segmentsVersion: '3.1.1',
					assetsCollection: '#dapp',
					segmentsCollection: '#_juno/releases'
				}
			});

			testCdnGetProposal({
				actor: () => actor,
				owner: () => controllerSubmit,
				proposalId: 32n
			});

			testCdnGetProposal({
				actor: () => actor,
				owner: () => controllerReadWrite,
				proposalId: 7n
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
				proposalId: 32n
			});

			testCdnGetProposal({
				actor: () => {
					actor.setIdentity(controller);
					return actor;
				},
				owner: () => controllerSubmit,
				proposalId: 32n
			});
		});

		it('should throw errors at committing a proposal', async () => {
			const { commit_proposal } = actor;

			await expect(
				commit_proposal({
					sha256: Array.from({ length: 32 }).map((_, i) => i),
					proposal_id: 32n
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
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		testCdnListProposals({
			actor: () => actor,
			proposalsLength: 43n
		});

		testCdnCountProposals({
			actor: () => actor,
			proposalsLength: 43n
		});
	});
});
