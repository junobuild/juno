import {
	idlFactoryOrbiter,
	idlFactoryOrbiter007,
	type OrbiterActor,
	type OrbiterActor007
} from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { fromNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import { satelliteIdMock } from '../../mocks/orbiter.mocks';
import { tick } from '../../utils/pic-tests.utils';
import {
	ORBITER_WASM_PATH,
	controllersInitArgs,
	downloadOrbiter
} from '../../utils/setup-tests.utils';

describe('Orbiter > Upgrade > Configuration', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor007>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadOrbiter('0.0.7');

		const { actor: c, canisterId: cId } = await pic.setupCanister<OrbiterActor007>({
			idlFactory: idlFactoryOrbiter007,
			wasm: destination,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	const upgradeVersion = async () => {
		await tick(pic);

		const destination = await downloadOrbiter('0.0.8');

		await pic.upgradeCanister({
			canisterId,
			wasm: destination,
			sender: controller.getPrincipal()
		});
	};

	const upgradeCurrent = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: ORBITER_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	describe('v0.0.7 -> v0.0.8', () => {
		it('should migrate no entry if the configuration was not set', async () => {
			await upgradeVersion();

			const newActor = pic.createActor<OrbiterActor>(idlFactoryOrbiter, canisterId);
			newActor.setIdentity(controller);

			const { list_satellite_configs } = newActor;

			const configs = await list_satellite_configs();

			expect(configs).toHaveLength(0);
		});

		it('should migrate configuration disabled to none', async () => {
			const { set_satellite_configs } = actor;

			await expect(
				set_satellite_configs([
					[
						satelliteIdMock,
						{
							version: [],
							enabled: false
						}
					]
				])
			).resolves.not.toThrow();

			await upgradeVersion();

			const newActor = pic.createActor<OrbiterActor>(idlFactoryOrbiter, canisterId);
			newActor.setIdentity(controller);

			const { list_satellite_configs } = newActor;

			const configs = await list_satellite_configs();

			expect(configs).toHaveLength(1);

			expect(configs[0][0].toText()).toEqual(satelliteIdMock.toText());
			expect(fromNullable(configs[0][1].version)).toBe(1n);
			expect(fromNullable(configs[0][1].features)).toBeUndefined();
		});

		it('should migrate configuration enabled to the new features', async () => {
			const { set_satellite_configs } = actor;

			await expect(
				set_satellite_configs([
					[
						satelliteIdMock,
						{
							version: [],
							enabled: true
						}
					]
				])
			).resolves.not.toThrow();

			await upgradeVersion();

			const newActor = pic.createActor<OrbiterActor>(idlFactoryOrbiter, canisterId);
			newActor.setIdentity(controller);

			const { list_satellite_configs } = newActor;

			const configs = await list_satellite_configs();

			expect(configs).toHaveLength(1);

			expect(configs[0][0].toText()).toEqual(satelliteIdMock.toText());
			expect(fromNullable(configs[0][1].version)).toBe(1n);
			expect(fromNullable(configs[0][1].features)).toEqual({
				page_views: true,
				performance_metrics: true,
				track_events: true
			});
		});
	});

	describe('v0.0.7 -> v0.0.8 -> current', () => {
		it('should migrate configuration enabled to the new features', async () => {
			const { set_satellite_configs } = actor;

			await expect(
				set_satellite_configs([
					[
						satelliteIdMock,
						{
							version: [],
							enabled: true
						}
					]
				])
			).resolves.not.toThrow();

			await upgradeVersion();

			await upgradeCurrent();

			const newActor = pic.createActor<OrbiterActor>(idlFactoryOrbiter, canisterId);
			newActor.setIdentity(controller);

			const { list_satellite_configs } = newActor;

			const configs = await list_satellite_configs();

			expect(configs).toHaveLength(1);

			expect(configs[0][0].toText()).toEqual(satelliteIdMock.toText());
			expect(fromNullable(configs[0][1].version)).toBe(1n);
			expect(fromNullable(configs[0][1].features)).toEqual({
				page_views: true,
				performance_metrics: true,
				track_events: true
			});
		});
	});
});
