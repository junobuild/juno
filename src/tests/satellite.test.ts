import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import {
	idlFactory as idlFactorSatellite,
	init as initSatellite
} from '$declarations/satellite/satellite.factory.did';
import { IDL } from '@dfinity/candid';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@hadronous/pic';
import { resolve } from 'node:path';
import { afterAll, beforeAll, expect } from 'vitest';

const WASM_PATH = resolve(
	process.cwd(),
	'.dfx',
	'local',
	'canisters',
	'satellite',
	'satellite.wasm'
);

console.log('HERE');

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
			arg: IDL.encode(initSatellite({ IDL }), [arg])
		});

		actor = fixture.actor;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should expose version', async () => {
		console.log(await actor.version());

		expect(await actor.version()).not.toBeNull();
	});
});
