import {
	idlFactoryMissionControl,
	idlFactorySatellite,
	type MissionControlActor,
	type SatelliteActor
} from '$declarations';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { PocketIc, type Actor } from '@dfinity/pic';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import {
	JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
	JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY,
	JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED,
	JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST
} from '@junobuild/errors';
import { inject } from 'vitest';
import { CONTROLLER_METADATA } from '../../../constants/controller-tests.constants';
import { missionControlUserInitArgs } from '../../../utils/mission-control-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import {
	controllersInitArgs,
	MISSION_CONTROL_WASM_PATH,
	SATELLITE_WASM_PATH
} from '../../../utils/setup-tests.utils';

describe('Mission Control > Controllers > Satellite', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let satelliteId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): Uint8Array => missionControlUserInitArgs(controller.getPrincipal());

		const { actor: c, canisterId: missionControlId } = await pic.setupCanister<MissionControlActor>(
			{
				idlFactory: idlFactoryMissionControl,
				wasm: MISSION_CONTROL_WASM_PATH,
				arg: userInitArgs(),
				sender: controller.getPrincipal()
			}
		);

		actor = c;

		const { canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorySatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs([controller.getPrincipal(), missionControlId]),
			sender: controller.getPrincipal()
		});

		satelliteId = cId;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should not be able to set a satellite because mission control is effectively not a controller', async () => {
		const { set_satellite } = actor;

		await expect(set_satellite(satelliteId, ['Hello'])).rejects.toThrowError(
			new RegExp(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER)
		);
	});

	describe('assert', () => {
		it('should throw errors on creating admin controller with expiration date', async () => {
			const { set_satellites_controllers } = actor;

			const controller = Ed25519KeyIdentity.generate();

			await expect(
				set_satellites_controllers([satelliteId], [controller.getPrincipal()], {
					...CONTROLLER_METADATA,
					scope: { Admin: null },
					expires_at: [1n]
				})
			).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY);
		});

		it.each([
			{ title: 'write', scope: { Write: null } },
			{ title: 'submit', scope: { Submit: null } }
		])(
			'should throw errors on creating controller with expiry in the past for $title',
			async ({ scope }) => {
				const { set_satellites_controllers } = actor;

				const controller = Ed25519KeyIdentity.generate();

				const now = toBigIntNanoSeconds(new Date(await pic.getTime()));

				await pic.advanceTime(10_000);
				await tick(pic);

				await expect(
					set_satellites_controllers([satelliteId], [controller.getPrincipal()], {
						...CONTROLLER_METADATA,
						scope,
						expires_at: [now]
					})
				).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST);
			}
		);

		it('should throw errors on creating anonymous controller', async () => {
			const { set_satellites_controllers } = actor;

			const controller = new AnonymousIdentity();

			await expect(
				set_satellites_controllers([satelliteId], [controller.getPrincipal()], {
					...CONTROLLER_METADATA,
					scope: { Admin: null },
					expires_at: [1n]
				})
			).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED);
		});
	});
});
