import type { SatelliteActor } from '$lib/api/actors/actor.factory';
import type { SatelliteDid } from '$lib/types/declarations';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, fromNullishNullable, toNullable } from '@dfinity/utils';
import {
	JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
	JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY
} from '@junobuild/errors';
import { uploadFile } from '../../../utils/cdn-tests.utils';
import { assertCertification } from '../../../utils/certification-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import { uploadAsset } from '../../../utils/satellite-storage-tests.utils';
import { setupSatelliteStock } from '../../../utils/satellite-tests.utils';

describe('Satellite > Switch storage system memory', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;
	let currentDate: Date;
	let controller: Ed25519KeyIdentity;
	let canisterIdUrl: string;

	const DAPP_COLLECTION = '#dapp';
	const RELEASES_COLLECTION = '#_juno/releases';
	const DOMAINS = ['hello.com', 'test2.com'];

	beforeAll(async () => {
		const {
			actor: a,
			canisterId: c,
			currentDate: cD,
			pic: p,
			controller: cO,
			canisterIdUrl: url
		} = await setupSatelliteStock({ withIndexHtml: true, memory: { Heap: null } });

		pic = p;
		canisterId = c;
		actor = a;
		currentDate = cD;
		controller = cO;
		canisterIdUrl = url;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on switch memory', async () => {
			const { switch_storage_system_memory } = actor;

			await expect(switch_storage_system_memory()).rejects.toThrow(
				JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER
			);
		});
	});

	describe('hacking', () => {
		const hacker = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(hacker);
		});

		it('should throw errors on switch memory', async () => {
			const { switch_storage_system_memory } = actor;

			await expect(switch_storage_system_memory()).rejects.toThrow(
				JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER
			);
		});
	});

	describe('controller', () => {
		beforeEach(() => {
			actor.setIdentity(controller);
		});

		const assertMemory = async ({
			memory,
			collection
		}: {
			memory: SatelliteDid.Memory;
			collection: string;
		}) => {
			const { get_rule } = actor;

			const result = fromNullable(await get_rule({ Storage: null }, collection));

			const ruleMemory = fromNullishNullable(result?.memory);

			expect(ruleMemory).toEqual(memory);
		};

		const switchMemory = async ({ memory }: { memory: SatelliteDid.Memory }) => {
			const { switch_storage_system_memory } = actor;

			await switch_storage_system_memory();

			await assertMemory({ memory, collection: DAPP_COLLECTION });
			await assertMemory({ memory, collection: RELEASES_COLLECTION });
		};

		const assertIcDomains = async () => {
			const { http_request } = actor;

			const request: SatelliteDid.HttpRequest = {
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

			const request: SatelliteDid.HttpRequest = {
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

			expect(JSON.parse(responseBody).alternativeOrigins.sort()).toEqual(alternativeOrigins.sort());

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
				const { switch_storage_system_memory } = actor;

				await expect(switch_storage_system_memory()).rejects.toThrow(
					`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${DAPP_COLLECTION})`
				);
			});

			const name = `hello-world.html`;
			const full_path = `/hello/${name}`;

			it('should throw errors when satellites has multiple assets', async () => {
				const { switch_storage_system_memory } = actor;

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

				await expect(switch_storage_system_memory()).rejects.toThrow(
					`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${DAPP_COLLECTION})`
				);
			});

			it('should throw errors when satellite has other assets than index.html', async () => {
				const { switch_storage_system_memory, del_asset } = actor;

				await del_asset(DAPP_COLLECTION, '/index.html');

				await expect(switch_storage_system_memory()).rejects.toThrow(
					`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${DAPP_COLLECTION})`
				);
			});

			it('should throw errors when satellite has one more asset that is not index.html', async () => {
				const { switch_storage_system_memory, del_asset } = actor;

				await del_asset(DAPP_COLLECTION, full_path);

				await expect(switch_storage_system_memory()).rejects.toThrow(
					`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${DAPP_COLLECTION})`
				);
			});

			it('should throw errors when satellite contains releases', async () => {
				const {
					switch_storage_system_memory,
					del_assets,
					init_proposal,
					submit_proposal,
					commit_proposal
				} = actor;

				await del_assets(DAPP_COLLECTION);

				const name = `satellite-v0.0.18.wasm.gz`;
				const full_path = `/_juno/releases/${name}`;

				const [proposalId, _] = await init_proposal({
					SegmentsDeployment: {
						mission_control_version: [],
						orbiter: [],
						satellite_version: ['0.0.18']
					}
				});

				await uploadFile({
					proposalId,
					actor,
					collection: RELEASES_COLLECTION,
					name,
					full_path,
					description: `change=${proposalId};version=v0.0.18`
				});

				const [__, proposal] = await submit_proposal(proposalId);

				const sha = fromNullable(proposal.sha256);
				assertNonNullish(sha);

				await commit_proposal({
					sha256: sha,
					proposal_id: proposalId
				});

				await expect(switch_storage_system_memory()).rejects.toThrow(
					`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Storage - ${RELEASES_COLLECTION})`
				);
			});
		});

		describe.each([
			{ title: 'Heap -> Stable', from: { Heap: null }, to: { Stable: null } },
			{ title: 'Stable -> Heap', from: { Stable: null }, to: { Heap: null } }
		])('$title', ({ from, to }) => {
			beforeAll(async () => {
				const { del_assets } = actor;

				await del_assets(RELEASES_COLLECTION);
			});

			it('should switch memory', async () => {
				await assertMemory({ memory: from, collection: DAPP_COLLECTION });
				await assertMemory({ memory: from, collection: RELEASES_COLLECTION });

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

				const config: SatelliteDid.SetAuthenticationConfig = {
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
