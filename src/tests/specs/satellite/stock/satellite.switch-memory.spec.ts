import type {
	HttpRequest,
	Memory,
	_SERVICE as SatelliteActor,
	SetAuthenticationConfig
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
import { tick } from '../../../utils/pic-tests.utils';
import { uploadAsset } from '../../../utils/satellite-storage-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Switch #dapp memory', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let canisterIdUrl: string;
	let actor: Actor<SatelliteActor>;

	const DAPP_COLLECTION = '#dapp';
	const STABLE_MEMORY: Memory = { Stable: null };
	const HEAP_MEMORY: Memory = { Heap: null };
	const DOMAINS = ['hello.com', 'test2.com'];

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

		canisterIdUrl = `https://${canisterId.toText()}.icp0.io`;
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

		const assertMemory = async ({ memory }: { memory: Memory }) => {
			const { get_rule } = actor;

			const result = fromNullable(await get_rule({ Storage: null }, DAPP_COLLECTION));

			const ruleMemory = fromNullishNullable(result?.memory);

			expect(ruleMemory).toEqual(memory);
		};

		const switchMemory = async (args: { memory: Memory }) => {
			const { switch_dapp_memory } = actor;

			await switch_dapp_memory();

			await assertMemory(args);
		};

		const assertIcDomains = async () => {
			const { http_request } = actor;

			const request: HttpRequest = {
				body: [],
				certificate_version: toNullable(2),
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

		const assertIIAlternativeOrigins = async () => {
			const { http_request } = actor;

			const request: HttpRequest = {
				body: [],
				certificate_version: toNullable(2),
				headers: [],
				method: 'GET',
				url: '/.well-known/ii-alternative-origins'
			};

			const response = await http_request(request);

			const { body } = response;

			const decoder = new TextDecoder();
			const responseBody = decoder.decode(body as Uint8Array<ArrayBufferLike>);

			const alternativeOrigins = [
				...DOMAINS.map((domain) => `https://${domain}`).reverse(),
				canisterIdUrl
			];

			expect(responseBody).toEqual(JSON.stringify({ alternativeOrigins }));
			expect(JSON.parse(responseBody).alternativeOrigins).toEqual(alternativeOrigins);

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

		describe.each([
			{ title: 'Heap -> Stable', from: { Heap: null }, to: { Stable: null } },
			{ title: 'Stable -> Heap', from: { Stable: null }, to: { Heap: null } }
		])('$title', ({ from, to }) => {
			beforeAll(async () => {
				const { del_assets } = actor;

				await del_assets(DAPP_COLLECTION);
			});

			it('should switch memory from heap to stable', async () => {
				await assertMemory({ memory: from });

				await switchMemory({ memory: to });
			});

			it('should migrate .well-known/ic-domains', async () => {
				await switchMemory({ memory: from });

				const { set_custom_domain } = actor;

				await set_custom_domain(DOMAINS[0], ['123456']);
				await set_custom_domain(DOMAINS[1], []);

				await tick(pic);

				await assertIcDomains();

				await switchMemory({ memory: to });

				await assertIcDomains();
			});

			it('should migrate .well-known/ii-alternative-origins', async () => {
				await switchMemory({ memory: from });

				const { set_auth_config, get_auth_config } = actor;

				const currentConfig = fromNullable(await get_auth_config());

				const config: SetAuthenticationConfig = {
					internet_identity: [
						{
							derivation_origin: ['domain.com'],
							external_alternative_origins: toNullable()
						}
					],
					rules: [],
					version: currentConfig?.version ?? []
				};

				await set_auth_config(config);

				await tick(pic);

				await assertIIAlternativeOrigins();

				await switchMemory({ memory: to });

				await assertIIAlternativeOrigins();
			});

			describe('Rollback', () => {
				beforeAll(async () => {
					const name = `hello-world.html`;
					const full_path = `/hello/${name}`;

					await uploadAsset({
						full_path,
						name,
						collection: DAPP_COLLECTION,
						actor
					});
				});

				afterAll(async () => {
					const { del_assets } = actor;

					await del_assets(DAPP_COLLECTION);
				});

				it('should rollback and still expose .well-known/ic-domains', async () => {
					await expect(switchMemory({ memory: from })).rejects.toThrow(
						`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${DAPP_COLLECTION})`
					);

					await assertIcDomains();
				});

				it('should rollback and still expose .well-known/ii-alternative-origins', async () => {
					await expect(switchMemory({ memory: from })).rejects.toThrow(
						`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${DAPP_COLLECTION})`
					);

					await assertIIAlternativeOrigins();
				});
			});
		});
	});
});
