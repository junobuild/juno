import type { _SERVICE as SatelliteActor, SetRule } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { IDL } from '@dfinity/candid';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { parse } from '@ltd/j-toml';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect } from 'vitest';

const WASM_PATH_LOCAL = resolve(
	process.cwd(),
	'.dfx',
	'local',
	'canisters',
	'satellite',
	'satellite.wasm'
);

const WASM_PATH_CI = resolve(process.cwd(), 'satellite.wasm.gz');

const WASM_PATH = existsSync(WASM_PATH_CI) ? WASM_PATH_CI : WASM_PATH_LOCAL;

describe('Satellite', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create();

		const arg = IDL.encode(
			[
				IDL.Record({
					controllers: IDL.Vec(IDL.Principal)
				})
			],
			[{ controllers: [controller.getPrincipal()] }]
		);

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: WASM_PATH,
			arg
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setRule: SetRule = {
		memory: toNullable(),
		updated_at: toNullable(),
		max_size: toNullable(),
		read: { Managed: null },
		mutable_permissions: toNullable(),
		write: { Managed: null }
	};

	let testRuleUpdatedAt: bigint | undefined;

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should create a collection', async () => {
			const { set_rule, list_rules, list_controllers } = actor;

			await set_rule({ Db: null }, 'test', setRule);

			const [[collection, { memory, created_at, updated_at, read, write }], _] = await list_rules({
				Db: null
			});

			expect(collection).toEqual('test');
			expect(memory).toEqual(toNullable({ Heap: null }));
			expect(read).toEqual({ Managed: null });
			expect(write).toEqual({ Managed: null });
			expect(created_at).toBeGreaterThan(0n);
			expect(updated_at).toBeGreaterThan(0n);

			testRuleUpdatedAt = updated_at;
		});
	});

	describe('admin guard', () => {
		const user = Ed25519KeyIdentity.generate();

		const ADMIN_ERROR_MSG = 'Caller is not an admin controller of the satellite.';
		const CONTROLLER_ERROR_MSG = 'Caller is not a controller of the satellite.';

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should throw errors on creating collections', async () => {
			const { set_rule } = actor;

			await expect(set_rule({ Db: null }, 'user-test', setRule)).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on list collections', async () => {
			const { list_rules } = actor;

			await expect(list_rules({ Db: null })).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting collections', async () => {
			const { del_rule } = actor;

			await expect(
				del_rule({ Db: null }, 'test', { updated_at: toNullable(testRuleUpdatedAt) })
			).rejects.toThrow(ADMIN_ERROR_MSG);
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
			).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on list controllers', async () => {
			const { list_controllers } = actor;

			await expect(list_controllers()).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting controller', async () => {
			const { del_controllers } = actor;

			await expect(
				del_controllers({
					controllers: [controller.getPrincipal()]
				})
			).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on setting config', async () => {
			const { set_config } = actor;

			await expect(
				set_config({
					storage: {
						headers: [],
						iframe: toNullable(),
						redirects: toNullable(),
						rewrites: []
					}
				})
			).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on getting config', async () => {
			const { get_config } = actor;

			await expect(get_config()).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on setting custom domain', async () => {
			const { set_custom_domain } = actor;

			await expect(set_custom_domain('hello.com', toNullable())).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on listing custom domains', async () => {
			const { list_custom_domains } = actor;

			await expect(list_custom_domains()).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting custom domains', async () => {
			const { del_custom_domain } = actor;

			await expect(del_custom_domain('hello.com')).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting docs', async () => {
			const { del_docs } = actor;

			await expect(del_docs('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on counting docs', async () => {
			const { count_docs } = actor;

			await expect(count_docs('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on deleting assets', async () => {
			const { del_assets } = actor;

			await expect(del_assets('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on counting assets', async () => {
			const { count_assets } = actor;

			await expect(count_assets('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on deposit cycles', async () => {
			const { deposit_cycles } = actor;

			await expect(
				deposit_cycles({
					cycles: 123n,
					destination_id: user.getPrincipal()
				})
			).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on getting memory size', async () => {
			const { memory_size } = actor;

			await expect(memory_size()).rejects.toThrow(CONTROLLER_ERROR_MSG);
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
