import type { SputnikActor, SputnikDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockHtml } from '../../mocks/storage.mocks';
import { assertCertification } from '../../utils/certification-tests.utils';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';

describe('Sputnik > sdk > setAssetHandler', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;

	const TEST_COLLECTION = 'test-setassethandler';
	const MOCK_COLLECTION = 'demo-setassethandler';

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		const {
			pic: p,
			actor: a,
			canisterId: cId
		} = await setupTestSputnik({
			withUpgrade: true,
			currentDate
		});

		pic = p;
		actor = a;
		canisterId = cId;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Storage: null }, MOCK_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const triggerHook = async (): Promise<void> => {
		const { set_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_COLLECTION, key, {
			data: [],
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);
	};

	it('should upload an asset in the storage', async () => {
		await triggerHook();

		const { http_request } = actor;

		const request: SputnikDid.HttpRequest = {
			body: [],
			certificate_version: toNullable(2),
			headers: [],
			method: 'GET',
			url: `/${MOCK_COLLECTION}/hello.html`
		};

		const response = await http_request(request);

		const decoder = new TextDecoder();
		const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

		expect(responseBody).toEqual(mockHtml);

		await assertCertification({
			canisterId,
			pic,
			request,
			response,
			currentDate
		});
	});
});
