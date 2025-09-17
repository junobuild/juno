import type {
	HttpRequest,
	Memory,
	_SERVICE as SatelliteActor
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { fromNullable, fromNullishNullable, toNullable } from '@dfinity/utils';
import {
	JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
	JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY
} from '@junobuild/errors';
import { inject } from 'vitest';
import { assertCertification } from '../../../utils/certification-tests.utils';
import { uploadAsset } from '../../../utils/satellite-storage-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

describe('Satellite > Switch #dapp memory', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;

	const DAPP_COLLECTION = '#dapp';
	const STABLE_MEMORY: Memory = { Stable: null };
	const HEAP_MEMORY: Memory = { Heap: null };

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

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on switch dapp memory', async () => {
			const { switch_dapp_memory } = actor;

			await expect(switch_dapp_memory()).rejects.toThrow(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});
	});

	describe('hacking', () => {
		const hacker = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(hacker);
		});

		it('should throw errors on switch dapp memory', async () => {
			const { switch_dapp_memory } = actor;

			await expect(switch_dapp_memory()).rejects.toThrow(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});
	});

	describe('controller', () => {
		beforeEach(() => {
			actor.setIdentity(controller);
		});

		const DOMAINS = ['hello.com', 'test2.com'];

		const assertMemory = async ({ memory }: { memory: Memory }) => {
			const { get_rule } = actor;

			const result = fromNullable(await get_rule({ Storage: null }, DAPP_COLLECTION));

			const ruleMemory = fromNullishNullable(result?.memory);

			expect(ruleMemory).toEqual(memory);
		};

		const assertIcDomains = async () => {
			const { http_request } = actor;

			const request: HttpRequest = {
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ic-domains'
			};

			const response = await http_request(request);

			const { body } = response;

			const decoder = new TextDecoder();

			expect(decoder.decode(body as Uint8Array<ArrayBufferLike>)).toContain(DOMAINS[0]);
			expect(decoder.decode(body as Uint8Array<ArrayBufferLike>)).toContain(DOMAINS[1]);

			await assertCertification({
				canisterId,
				pic,
				request,
				response,
				currentDate
			});
		};

		describe('Errors', () => {
			it('should throw errors because stock satellite has an index.html', async () => {
				const { switch_dapp_memory } = actor;

				await expect(switch_dapp_memory()).rejects.toThrow(
					`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${DAPP_COLLECTION})`
				);
			});

			const name = `hello-world.html`;
			const full_path = `/hello/${name}`;

			it('should throw errors when satellites has multiple assets', async () => {
				const { switch_dapp_memory } = actor;

				await uploadAsset({
					full_path,
					name,
					collection: DAPP_COLLECTION,
					actor
				});

				const name2 = `hello-world2.html`;
				const full_path2 = `/hello/${name2}`;

				await uploadAsset({
					full_path: full_path2,
					name: name2,
					collection: DAPP_COLLECTION,
					actor
				});

				await expect(switch_dapp_memory()).rejects.toThrow(
					`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${DAPP_COLLECTION})`
				);
			});

			it('should throw errors when satellite has other assets than index.html', async () => {
				const { switch_dapp_memory, del_asset } = actor;

				await del_asset(DAPP_COLLECTION, '/index.html');

				await expect(switch_dapp_memory()).rejects.toThrow(
					`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${DAPP_COLLECTION})`
				);
			});

			it('should throw errors when satellite has one more asset that is not index.html', async () => {
				const { switch_dapp_memory, del_asset } = actor;

				await del_asset(DAPP_COLLECTION, full_path);

				await expect(switch_dapp_memory()).rejects.toThrow(
					`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${DAPP_COLLECTION})`
				);
			});
		});

		describe('Success', () => {
			beforeAll(async () => {
				const { del_assets } = actor;

				await del_assets(DAPP_COLLECTION);
			});

			it('should switch memory from heap to stable', async () => {
				const { switch_dapp_memory } = actor;

				await assertMemory({ memory: HEAP_MEMORY });

				await switch_dapp_memory();

				await assertMemory({ memory: STABLE_MEMORY });
			});

			it('should migrate .well-known/ic-domains', async () => {
				const { switch_dapp_memory, set_custom_domain } = actor;

				await switch_dapp_memory();

				await set_custom_domain(DOMAINS[0], ['123456']);
				await set_custom_domain(DOMAINS[1], []);

				await tick(pic);

				await assertIcDomains();

				await switch_dapp_memory();

				await assertIcDomains();
			});
		});
	});
});
