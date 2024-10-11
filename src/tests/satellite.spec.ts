import type { _SERVICE as SatelliteActor, SetRule } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { parse } from '@ltd/j-toml';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import {
	CONTROLLER_ERROR_MSG,
	INVALID_VERSION_ERROR_MSG,
	NO_VERSION_ERROR_MSG,
	SATELLITE_ADMIN_ERROR_MSG
} from './constants/satellite-tests.constants';
import { SATELLITE_WASM_PATH, controllersInitArgs } from './utils/setup-tests.utils';

describe('Satellite', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setRule: SetRule = {
		memory: toNullable(),
		max_size: toNullable(),
		max_capacity: toNullable(),
		read: { Managed: null },
		mutable_permissions: toNullable(),
		write: { Managed: null },
		version: toNullable()
	};

	let testRuleVersion: [] | [bigint];

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should create a collection', async () => {
			const { set_rule, list_rules } = actor;

			await set_rule({ Db: null }, 'test', setRule);

			const [[collection, { memory, version, created_at, updated_at, read, write }], _] =
				await list_rules({
					Db: null
				});

			expect(collection).toEqual('test');
			expect(memory).toEqual(toNullable({ Stable: null }));
			expect(read).toEqual({ Managed: null });
			expect(write).toEqual({ Managed: null });
			expect(created_at).toBeGreaterThan(0n);
			expect(updated_at).toBeGreaterThan(0n);
			expect(version).toEqual(toNullable(1n));

			testRuleVersion = version;
		});

		it('should list collections', async () => {
			const { list_rules } = actor;

			const [
				[collection, { updated_at, created_at, memory, mutable_permissions, read, write }],
				_
			] = await list_rules({ Db: null });

			expect(collection).toEqual('test');
			expect(memory).toEqual(toNullable({ Stable: null }));
			expect(read).toEqual({ Managed: null });
			expect(write).toEqual({ Managed: null });
			expect(mutable_permissions).toEqual([true]);
			expect(created_at).toBeGreaterThan(0n);
			expect(updated_at).toBeGreaterThan(0n);
		});

		it('should add and remove collections', async () => {
			const { list_rules, set_rule, del_rule } = actor;

			await set_rule({ Db: null }, 'test2', setRule);

			const rules = await list_rules({ Db: null });
			expect(rules).toHaveLength(2);

			const [_, { version }] = rules[1];

			await del_rule({ Db: null }, 'test2', {
				version
			});

			expect(await list_rules({ Db: null })).toHaveLength(1);
		});

		it('should add and remove additional controller', async () => {
			const { set_controllers, del_controllers, list_controllers } = actor;

			const newController = Ed25519KeyIdentity.generate();

			const controllers = await set_controllers({
				controllers: [newController.getPrincipal()],
				controller: {
					expires_at: toNullable(),
					metadata: [],
					scope: { Admin: null }
				}
			});

			expect(controllers).toHaveLength(2);

			expect(
				controllers.find(([p]) => p.toText() === controller.getPrincipal().toText())
			).not.toBeUndefined();

			expect(
				controllers.find(([p]) => p.toText() === newController.getPrincipal().toText())
			).not.toBeUndefined();

			await del_controllers({
				controllers: [newController.getPrincipal()]
			});

			const updatedControllers = await list_controllers();
			expect(updatedControllers).toHaveLength(1);
			expect(updatedControllers[0][0].toText()).toEqual(controller.getPrincipal().toText());
		});

		describe('errors', () => {
			it('should throw errors on creating reserved collection', async () => {
				const { set_rule } = actor;

				await expect(set_rule({ Db: null }, '#test', setRule)).rejects.toThrow(
					'Collection starts with #, a reserved prefix'
				);
			});

			it('should not update rule if no version', async () => {
				const { set_rule } = actor;

				await set_rule({ Db: null }, 'test3', setRule);

				await pic.advanceTime(100);

				await expect(set_rule({ Db: null }, 'test3', setRule)).rejects.toThrow(
					NO_VERSION_ERROR_MSG
				);
			});

			it('should not update rule if invalid version', async () => {
				const { set_rule } = actor;

				await set_rule({ Db: null }, 'test4', setRule);

				await pic.advanceTime(100);

				try {
					await set_rule({ Db: null }, 'test4', {
						...setRule,
						version: [123n]
					});

					expect(true).toBe(false);
				} catch (error: unknown) {
					expect((error as Error).message).toContain(INVALID_VERSION_ERROR_MSG);
				}
			});
		});
	});

	describe('admin guard', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should throw errors on creating collections', async () => {
			const { set_rule } = actor;

			await expect(set_rule({ Db: null }, 'user-test', setRule)).rejects.toThrow(
				SATELLITE_ADMIN_ERROR_MSG
			);
		});

		it('should throw errors on list collections', async () => {
			const { list_rules } = actor;

			await expect(list_rules({ Db: null })).rejects.toThrow(SATELLITE_ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting collections', async () => {
			const { del_rule } = actor;

			await expect(del_rule({ Db: null }, 'test', { version: testRuleVersion })).rejects.toThrow(
				SATELLITE_ADMIN_ERROR_MSG
			);
		});

		it('should throw errors on creating controller', async () => {
			const { set_controllers } = actor;

			const controller = Ed25519KeyIdentity.generate();

			await expect(
				set_controllers({
					controllers: [controller.getPrincipal()],
					controller: {
						expires_at: toNullable(),
						metadata: [],
						scope: { Admin: null }
					}
				})
			).rejects.toThrow(SATELLITE_ADMIN_ERROR_MSG);
		});

		it('should throw errors on list controllers', async () => {
			const { list_controllers } = actor;

			await expect(list_controllers()).rejects.toThrow(SATELLITE_ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting controller', async () => {
			const { del_controllers } = actor;

			await expect(
				del_controllers({
					controllers: [controller.getPrincipal()]
				})
			).rejects.toThrow(SATELLITE_ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting docs', async () => {
			const { del_docs } = actor;

			await expect(del_docs('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on counting docs', async () => {
			const { count_collection_docs } = actor;

			await expect(count_collection_docs('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on deleting assets', async () => {
			const { del_assets } = actor;

			await expect(del_assets('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on counting assets', async () => {
			const { count_collection_assets } = actor;

			await expect(count_collection_assets('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on deposit cycles', async () => {
			const { deposit_cycles } = actor;

			await expect(
				deposit_cycles({
					cycles: 123n,
					destination_id: user.getPrincipal()
				})
			).rejects.toThrow(SATELLITE_ADMIN_ERROR_MSG);
		});

		it('should throw errors on getting memory size', async () => {
			const { memory_size } = actor;

			await expect(memory_size()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on trying to deploy dapp', async () => {
			const { init_asset_upload } = actor;

			await expect(
				init_asset_upload({
					collection: '#dapp',
					description: toNullable(),
					encoding_type: [],
					full_path: '/hello.html',
					name: 'hello.html',
					token: toNullable()
				})
			).rejects.toThrow('Caller not allowed to upload data.');
		});
	});

	describe('public', () => {
		it('should expose version of the consumer', async () => {
			const tomlFile = readFileSync(join(process.cwd(), 'src', 'satellite', 'Cargo.toml'));

			type Toml = { package: { version: string } } | undefined;

			const result: Toml = parse(tomlFile.toString()) as unknown as Toml;

			expect(result?.package?.version).not.toBeNull();

			expect(await actor.version()).toEqual(result?.package?.version);
		});
	});
});
