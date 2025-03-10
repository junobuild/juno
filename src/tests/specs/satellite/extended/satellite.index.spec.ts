import type {
	HttpRequest,
	_SERVICE as SatelliteActor
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { assertCertification } from '../../../utils/certification-test.utils';
import { deleteDefaultIndexHTML } from '../../../utils/satellite-tests.utils';
import { SATELLITE_WASM_PATH, controllersInitArgs } from '../../../utils/setup-tests.utils';

describe('Satellite > Index HTML', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
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

	it('should provide index.html with a valid certification', async () => {
		const { http_request } = actor;

		const request: HttpRequest = {
			body: [],
			certificate_version: toNullable(2),
			headers: [],
			method: 'GET',
			url: '/'
		};

		const response = await http_request(request);

		await assertCertification({
			canisterId,
			pic,
			request,
			response,
			currentDate
		});
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
