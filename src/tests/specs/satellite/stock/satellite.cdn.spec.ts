import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { type Actor, PocketIc } from '@hadronous/pic';
import {
	JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
	JUNO_AUTH_ERROR_NOT_CONTROLLER
} from '@junobuild/errors';
import { beforeAll, describe, expect, inject } from 'vitest';
import {
	testCdnConfig,
	testCdnGetProposal,
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

	const testNotAllowedCdnMethodsInMSatellite = ({
		actor,
		errorMsg
	}: {
		actor: () => Actor<SatelliteActor | ConsoleActor>;
		errorMsg: string;
	}) => {
		it('should throw errors on get proposal', async () => {
			const { get_proposal } = actor();

			await expect(get_proposal(1n)).rejects.toThrow(errorMsg);
		});
	};

	describe('Anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testNotAllowedCdnMethods({
			actor: () => actor,
			errorMsgAdminController: JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
			errorMsgController: JUNO_AUTH_ERROR_NOT_CONTROLLER
		});

		testNotAllowedCdnMethodsInMSatellite({
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
			errorMsgController: JUNO_AUTH_ERROR_NOT_CONTROLLER
		});

		testNotAllowedCdnMethodsInMSatellite({
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
		const user = Ed25519KeyIdentity.generate();

		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					scope: { Write: null },
					metadata: [],
					expires_at: []
				},
				controllers: [user.getPrincipal()]
			});

			actor.setIdentity(user);
		});

		beforeEach(() => {
			actor.setIdentity(user);
		});

		testControlledCdnMethods({
			actor: (params) => {
				if (params?.requireController === true) {
					actor.setIdentity(controller);
				} else {
					actor.setIdentity(user);
				}

				return actor;
			},
			currentDate,
			canisterId: () => canisterId,
			caller: () => user,
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
			owner: () => user,
			proposalId: 5n
		});

		testCdnGetProposal({
			actor: () => actor,
			owner: () => controller
		});

		it('should throw errors at committing a proposal', async () => {
			const { commit_proposal } = actor;

			await expect(
				commit_proposal({
					sha256: Array.from({ length: 32 }).map((_, i) => i),
					proposal_id: 5n
				})
			).rejects.toThrow(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});

		it('should throw errors on delete proposal assets', async () => {
			const { delete_proposal_assets } = actor;

			await expect(delete_proposal_assets({ proposal_ids: [1n] })).rejects.toThrow(
				JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER
			);
		});
	});

	describe('Admin for releases', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		testCdnConfig({
			actor: () => actor
		});

		testReleasesProposal({
			actor: () => actor,
			moduleNames: [
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
			collection: '#_juno',
			fullPathPrefix: '/_juno/releases'
		});

		testCdnStorageSettings({
			actor: () => actor,
			pic: () => pic
		});
	});
});
