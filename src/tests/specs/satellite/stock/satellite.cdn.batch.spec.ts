import { type SatelliteActor, idlFactorySatellite } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { inject } from 'vitest';
import { testUploadProposalManyAssets } from '../../../utils/cdn-assertions-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Cdn > Batch', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();
	const controllerReadWrite = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorySatellite,
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

	describe('Admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		testUploadProposalManyAssets({
			expectedProposalId: 1n,
			actor: () => actor,
			currentDate,
			canisterId: () => canisterId,
			caller: () => controller,
			pic: () => pic
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

		testUploadProposalManyAssets({
			expectedProposalId: 2n,
			actor: () => actor,
			currentDate,
			canisterId: () => canisterId,
			caller: () => controllerReadWrite,
			pic: () => pic
		});
	});
});
