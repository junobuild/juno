import type { SatelliteActor, SatelliteDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { mockHtml } from '../../../../mocks/storage.mocks';
import { assertCertification } from '../../../../utils/certification-tests.utils';
import { uploadAsset } from '../../../../utils/satellite-storage-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';

describe('Satellite > Storage > Head', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	let canisterId: Principal;
	let currentDate: Date;

	const name = `hello-world.html`;
	const full_path = `/hello/${name}`;

	const DAPP_COLLECTION = '#dapp';

	beforeAll(async () => {
		const { actor: a, pic: p, currentDate: cD, canisterId: cI } = await setupSatelliteStock();

		pic = p;
		actor = a;
		currentDate = cD;
		canisterId = cI;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should support head request', async () => {
		const { http_request } = actor;

		await uploadAsset({
			full_path,
			name,
			collection: DAPP_COLLECTION,
			actor
		});

		const request: SatelliteDid.HttpRequest = {
			body: Uint8Array.from([]),
			certificate_version: toNullable(2),
			headers: [],
			method: 'HEAD',
			url: full_path
		};

		const response = await http_request(request);

		const { body, status_code } = response;

		const decoder = new TextDecoder();

		expect(decoder.decode(body)).toEqual(mockHtml);
		expect(status_code).toEqual(200);

		await assertCertification({
			canisterId,
			pic,
			request,
			response,
			currentDate,
			statusCode: 200
		});
	});

	it('should return body with head request', async () => {
		const { http_request } = actor;

		await uploadAsset({
			full_path,
			name,
			collection: DAPP_COLLECTION,
			actor
		});

		const request: SatelliteDid.HttpRequest = {
			body: Uint8Array.from([]),
			certificate_version: toNullable(2),
			headers: [],
			method: 'HEAD',
			url: full_path
		};

		const response = await http_request(request);

		const { body } = response;

		const decoder = new TextDecoder();

		expect(decoder.decode(body)).toEqual(mockHtml);
	});
});
