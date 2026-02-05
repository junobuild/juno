import { idlFactorySatellite, type SatelliteActor, type SatelliteDid } from '$declarations';
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
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../../utils/setup-tests.utils';

describe.each([
	{ title: 'heap', memory: { Heap: null } },
	{ title: 'stable', memory: { Stable: null } }
])('Satellite > Controllers > Guards $title', ({ memory }) => {
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

		const setRule: SatelliteDid.SetRule = {
			memory: toNullable(memory),
			max_size: toNullable(),
			read: { Managed: null },
			mutable_permissions: toNullable(),
			write: { Managed: null },
			version: toNullable(),
			max_capacity: toNullable(),
			rate_config: toNullable(),
			max_changes_per_user: toNullable()
		};

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, setRule);
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
					expires_at: [toBigIntNanoSeconds(currentDate)]
				},
				controllers: [testController.getPrincipal()]
			});

			actor.setIdentity(testController);

			await pic.advanceTime(100);
		});

		it('should throw on get_proposal', async () => {
			const { get_proposal } = actor;

			await expect(get_proposal(123n)).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_CONTROLLER);
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
					expires_at: [toBigIntNanoSeconds(currentDate)]
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
	});
});
