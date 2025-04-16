import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-test.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { addSomeAssetsToBeListed, initVersionMock } from '../../utils/sputnik-tests.utils';
import type {HttpRequest} from "$declarations/satellite/satellite.did";
import {assertCertification} from "../../utils/certification-test.utils";

describe('Sputnik > sdk > setAssetHandler', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;

	const TEST_COLLECTION = 'test-setassethandler';
	const MOCK_COLLECTION = 'demo-setassethandler';

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { pic: p, actor: a, canisterId: cId } = await setupTestSputnik();

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

		const request: HttpRequest = {
			body: [],
			certificate_version: toNullable(2),
			headers: [],
			method: 'GET',
			url: `/${MOCK_COLLECTION}/hello.html`
		};

		const response = await http_request(request);

		const decoder = new TextDecoder();
		const responseBody = decoder.decode(response.body as Uint8Array<ArrayBufferLike>);

		console.log(responseBody);

		await assertCertification({
			canisterId,
			pic,
			request,
			response,
			currentDate
		});
	});
});
