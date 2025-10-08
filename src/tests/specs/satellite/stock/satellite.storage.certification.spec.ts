import type { SatelliteActor, SatelliteDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { MEMORIES } from '../../../constants/satellite-tests.constants';
import { assertCertification } from '../../../utils/certification-tests.utils';
import { uploadAsset } from '../../../utils/satellite-storage-tests.utils';
import { setupSatelliteStock } from '../../../utils/satellite-tests.utils';

describe.each(MEMORIES)('Satellite > Storage > Certificate > $title', ({ memory }) => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;
	let currentDate: Date;

	beforeAll(async () => {
		const {
			actor: a,
			canisterId: c,
			currentDate: cD,
			pic: p,
			controller
		} = await setupSatelliteStock({
			withIndexHtml: true,
			memory
		});

		pic = p;
		canisterId = c;
		actor = a;
		currentDate = cD;

		actor.setIdentity(controller);
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

		const request: SatelliteDid.HttpRequest = {
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
