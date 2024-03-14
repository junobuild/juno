import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { IDL } from '@dfinity/candid';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@hadronous/pic';
import { parse } from '@ltd/j-toml';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, expect } from 'vitest';

const WASM_PATH = resolve(
	process.cwd(),
	'.dfx',
	'local',
	'canisters',
	'satellite',
	'satellite.wasm'
);

describe('Satellite', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	beforeAll(async () => {
		pic = await PocketIc.create();

		const identity = Ed25519KeyIdentity.generate();

		const arg = IDL.encode(
			[
				IDL.Record({
					controllers: IDL.Vec(IDL.Principal)
				})
			],
			[{ controllers: [identity.getPrincipal()] }]
		);

		const fixture = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: WASM_PATH,
			arg
		});

		actor = fixture.actor;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should expose version of the consumer', async () => {
		const tomlFile = readFileSync(join(process.cwd(), 'src', 'satellite', 'Cargo.toml'));

		type Toml = { package: { version: string } } | undefined;

		const result: Toml = parse(tomlFile.toString()) as unknown as Toml;

		expect(result?.package?.version).not.toBeNull();

		expect(await actor.version()).toEqual(result?.package?.version);
	});
});
