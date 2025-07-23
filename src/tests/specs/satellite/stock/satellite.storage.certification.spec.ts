import type {
	HttpRequest,
	_SERVICE as SatelliteActor
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { afterAll, beforeAll, describe, inject } from 'vitest';
import { assertCertification } from '../../../utils/certification-tests.utils';
import { uploadAsset } from '../../../utils/satellite-storage-tests.utils';
import { deleteDefaultIndexHTML } from '../../../utils/satellite-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Storage > Certificate', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: a, canisterId: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = a;
		canisterId = c;

		await deleteDefaultIndexHTML({ actor, controller });
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const upload = async (params: {
		full_path: string;
		name: string;
		collection: string;
		headers?: [string, string][];
		encoding_type?: [] | [string];
	}) => {
		await uploadAsset({
			...params,
			actor
		});
	};

	const assertResponse = async ({
		full_path,
		headers = []
	}: {
		full_path: string;
		headers?: [string, string][];
	}) => {
		const { http_request } = actor;

		const request: HttpRequest = {
			body: [],
			certificate_version: toNullable(2),
			headers,
			method: 'GET',
			url: full_path
		};

		const response = await http_request(request);

		await assertCertification({
			canisterId,
			pic,
			request,
			response,
			currentDate
		});
	};

	it('should provide asset with certificate for identity', async () => {
		const name = 'hello.html';
		const full_path = `/${name}`;

		await upload({ full_path, name, collection: '#dapp' });

		await assertResponse({ full_path });
	});

	it('should provide asset with certificate for gzip', async () => {
		const name = 'hello2.html';
		const full_path = `/${name}`;

		await upload({ full_path, name, collection: '#dapp', encoding_type: ['gzip'] });

		await assertResponse({ full_path, headers: [['accept-encoding', 'gzip, deflate, br, zstd']] });
	});

	it('should provide asset with certificate for identity and gzip', async () => {
		const name = 'hello3.html';
		const full_path = `/${name}`;

		await upload({ full_path, name, collection: '#dapp', encoding_type: ['gzip'] });
		await upload({ full_path, name, collection: '#dapp' });

		await assertResponse({ full_path, headers: [['accept-encoding', 'gzip, deflate, br, zstd']] });
		await assertResponse({ full_path });
	});
});
