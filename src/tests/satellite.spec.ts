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
		});
	});

	describe('user', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should throw errors on creating collections', async () => {
			const { set_rule, list_controllers } = actor;

			await expect(set_rule({ Db: null }, 'user-test', setRule)).rejects.toThrow(
				'Caller is not an admin controller of the satellite.'
			);
		});

		it('should throw errors on list collections', async () => {
			const { list_rules, list_controllers } = actor;

			await expect(list_rules({ Db: null })).rejects.toThrow(
				'Caller is not an admin controller of the satellite.'
			);
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
