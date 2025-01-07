import type {
	Config,
	CyclesMonitoringStrategy,
	_SERVICE as MissionControlActor
} from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from './constants/mission-control-tests.constants';
import { missionControlUserInitArgs } from './utils/mission-control-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from './utils/setup-tests.utils';

describe('Mission Control', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	const controller = Ed25519KeyIdentity.generate();

	const metadata: [string, string][] = [['email', 'test@test.com']];

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): ArrayBuffer => missionControlUserInitArgs(controller.getPrincipal());

		const { actor: c } = await pic.setupCanister<MissionControlActor>({
			idlFactory: idlFactorMissionControl,
			wasm: MISSION_CONTROL_WASM_PATH,
			arg: userInitArgs(),
			sender: controller.getPrincipal()
		});

		actor = c;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const testGuards = () => {
		it('should throw errors on get user', async () => {
			const { get_user } = actor;

			await expect(get_user()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on get metadata', async () => {
			const { get_metadata } = actor;

			await expect(get_metadata()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on get metadata', async () => {
			const { set_metadata } = actor;

			await expect(set_metadata(metadata)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on get settings', async () => {
			const { get_settings } = actor;

			await expect(get_settings()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	};

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testGuards();
	});

	describe('user', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		testGuards();
	});

	describe('controller', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should set metadata', async () => {
			const { set_metadata, get_metadata } = actor;

			await set_metadata(metadata);

			const saved_metadata = await get_metadata();

			expect(saved_metadata).toEqual(metadata);
		});

		it('should set metadata config without overwriting config', async () => {
			const { set_config, get_config, set_metadata, get_metadata } = actor;

			const strategy: CyclesMonitoringStrategy = {
				BelowThreshold: {
					min_cycles: 500_000n,
					fund_cycles: 100_000n
				}
			};

			const config: Config = {
				monitoring: [
					{
						cycles: [
							{
								default_strategy: [strategy],
								notification: [
									{
										enabled: true,
										to: toNullable()
									}
								]
							}
						]
					}
				]
			};

			await set_config(toNullable(config));

			await set_metadata(metadata);

			const saved_metadata = await get_metadata();

			expect(saved_metadata).toEqual(metadata);

			const saved_config = await get_config();

			expect(fromNullable(saved_config)).toEqual(config);
		});
	});
});
