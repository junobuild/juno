import { idlFactorySatellite, type SatelliteActor } from '$declarations';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { type Actor, PocketIc } from '@dfinity/pic';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import {
	JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY,
	JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED,
	JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST
} from '@junobuild/errors';
import { inject } from 'vitest';
import { CONTROLLER_METADATA } from '../../../../constants/controller-tests.constants';
import { tick } from '../../../../utils/pic-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../../utils/setup-tests.utils';

describe('Satellite > Controllers > Create', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

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

	it('should throw errors on creating admin controller with expiration date', async () => {
		const { set_controllers } = actor;

		const controller = Ed25519KeyIdentity.generate();

		await expect(
			set_controllers({
				controllers: [controller.getPrincipal()],
				controller: {
					...CONTROLLER_METADATA,
					scope: { Admin: null },
					expires_at: [1n]
				}
			})
		).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY);
	});

	it.each([
		{ title: 'write', scope: { Write: null } },
		{ title: 'submit', scope: { Submit: null } }
	])(
		'should throw errors on creating controller with expiry in the past for $title',
		async ({ scope }) => {
			const { set_controllers } = actor;

			const controller = Ed25519KeyIdentity.generate();

			const now = toBigIntNanoSeconds(new Date(await pic.getTime()));

			await pic.advanceTime(10_000);
			await tick(pic);

			await expect(
				set_controllers({
					controllers: [controller.getPrincipal()],
					controller: {
						...CONTROLLER_METADATA,
						scope,
						expires_at: [now]
					}
				})
			).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST);
		}
	);

	it('should throw errors on creating anonymous controller', async () => {
		const { set_controllers } = actor;

		const controller = new AnonymousIdentity();

		await expect(
			set_controllers({
				controllers: [controller.getPrincipal()],
				controller: {
					...CONTROLLER_METADATA,
					scope: { Admin: null },
					expires_at: [1n]
				}
			})
		).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED);
	});
});
