import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { deleteDefaultIndexHTML } from './utils/satellite-tests.utils';
import { SATELLITE_WASM_PATH, controllersInitArgs } from './utils/setup-tests.utils';

describe('Satellite Index HTML', () => {
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

	it('should expose a default index.html', async () => {
		const { http_request } = actor;

		const { body } = await http_request({
			body: [],
			certificate_version: toNullable(),
			headers: [],
			method: 'GET',
			url: '/'
		});

		const decoder = new TextDecoder();
		const responseBody = decoder.decode(body as Uint8Array<ArrayBufferLike>);

		const sourceIndexHTML = readFileSync(
			join(process.cwd(), 'src', 'satellite', 'resources', 'index.html'),
			'utf-8'
		);

		expect(responseBody).toEqual(sourceIndexHTML);
	});

	it('should be able to delete default index.html', async () => {
		await deleteDefaultIndexHTML({ actor, controller });

		const { http_request } = actor;

		const { status_code } = await http_request({
			body: [],
			certificate_version: toNullable(),
			headers: [],
			method: 'GET',
			url: '/'
		});

		expect(status_code).toBe(404);
	});
});
