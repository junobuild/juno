import type {
	ListParams,
	_SERVICE as SatelliteActor,
	SetRule,
	StorageConfig
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { arrayBufferToUint8Array, fromNullable, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, inject } from 'vitest';
import {
	CONTROLLER_ERROR_MSG,
	SATELLITE_ADMIN_ERROR_MSG
} from './constants/satellite-tests.constants';
import { deleteDefaultIndexHTML } from './utils/satellite-tests.utils';
import { SATELLITE_WASM_PATH, controllersInitArgs } from './utils/setup-tests.utils';

describe('Satellite storage', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

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

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on delete all assets', async () => {
			const { del_assets } = actor;

			await expect(del_assets('#dapp')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on setting config', async () => {
			const { set_storage_config } = actor;

			await expect(
				set_storage_config({
					headers: [],
					iframe: toNullable(),
					redirects: toNullable(),
					rewrites: [],
					raw_access: toNullable(),
					max_memory_size: toNullable()
				})
			).rejects.toThrow(SATELLITE_ADMIN_ERROR_MSG);
		});

		it('should throw errors on getting config', async () => {
			const { get_config } = actor;

			await expect(get_config()).rejects.toThrow(SATELLITE_ADMIN_ERROR_MSG);
		});
	});

	describe('hacking', () => {
		const hacker = Ed25519KeyIdentity.generate();

		beforeEach(() => {
			actor.setIdentity(controller);
		});

		it('should throw errors on upload chunk to admin batch', async () => {
			const { init_asset_upload, upload_asset_chunk } = actor;

			const batch = await init_asset_upload({
				collection: '#dapp',
				description: toNullable(),
				encoding_type: [],
				full_path: '/hello.html',
				name: 'hello.html',
				token: toNullable()
			});

			actor.setIdentity(hacker);

			await expect(
				upload_asset_chunk({
					batch_id: batch.batch_id,
					content: [],
					order_id: [0n]
				})
			).rejects.toThrow('Bach initializer does not match chunk uploader.');
		});

		it('should throw errors on trying to commit admin batch', async () => {
			const { init_asset_upload, commit_asset_upload, upload_asset_chunk } = actor;

			const batch = await init_asset_upload({
				collection: '#dapp',
				description: toNullable(),
				encoding_type: [],
				full_path: '/hello.html',
				name: 'hello.html',
				token: toNullable()
			});

			const chunk = await upload_asset_chunk({
				batch_id: batch.batch_id,
				content: [],
				order_id: [0n]
			});

			actor.setIdentity(hacker);

			await expect(
				commit_asset_upload({
					batch_id: batch.batch_id,
					chunk_ids: [chunk.chunk_id],
					headers: []
				})
			).rejects.toThrow('Cannot commit batch.');
		});
	});

	const HTML = '<html><body>Hello</body></html>';

	const blob = new Blob([HTML], {
		type: 'text/plain; charset=utf-8'
	});

	const upload = async ({
		full_path,
		name,
		collection
	}: {
		full_path: string;
		name: string;
		collection: string;
	}) => {
		const { commit_asset_upload, upload_asset_chunk, init_asset_upload } = actor;

		const file = await init_asset_upload({
			collection,
			description: toNullable(),
			encoding_type: [],
			full_path,
			name,
			token: toNullable()
		});

		const chunk = await upload_asset_chunk({
			batch_id: file.batch_id,
			content: arrayBufferToUint8Array(await blob.arrayBuffer()),
			order_id: [0n]
		});

		await commit_asset_upload({
			batch_id: file.batch_id,
			chunk_ids: [chunk.chunk_id],
			headers: []
		});
	};

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should set and get config', async () => {
			const { set_storage_config, get_config } = actor;

			const storage: StorageConfig = {
				headers: [['*', [['Cache-Control', 'no-cache']]]],
				iframe: toNullable({ Deny: null }),
				redirects: [],
				rewrites: [],
				raw_access: toNullable(),
				max_memory_size: toNullable()
			};

			await set_storage_config(storage);

			const configs = await get_config();

			expect(configs).toEqual({
				storage,
				authentication: toNullable(),
				db: toNullable()
			});
		});

		it('should deploy asset to dapp', async () => {
			const { http_request, commit_asset_upload, upload_asset_chunk, init_asset_upload } = actor;

			const file = await init_asset_upload({
				collection: '#dapp',
				description: toNullable(),
				encoding_type: [],
				full_path: '/hello.html',
				name: 'hello.html',
				token: toNullable()
			});

			const HTML = '<html><body>Hello</body></html>';

			const blob = new Blob([HTML], {
				type: 'text/plain; charset=utf-8'
			});

			const chunk = await upload_asset_chunk({
				batch_id: file.batch_id,
				content: arrayBufferToUint8Array(await blob.arrayBuffer()),
				order_id: [0n]
			});

			await commit_asset_upload({
				batch_id: file.batch_id,
				chunk_ids: [chunk.chunk_id],
				headers: []
			});

			const { headers, body } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/hello.html'
			});

			const rest = headers.filter(([header, _]) => header !== 'IC-Certificate');

			expect(rest).toEqual([
				['accept-ranges', 'bytes'],
				['etag', '"03ee66f1452916b4f91a504c1e9babfa201b6d64c26a82b2cf03c3ed49d91585"'],
				['X-Content-Type-Options', 'nosniff'],
				['Strict-Transport-Security', 'max-age=31536000 ; includeSubDomains'],
				['Referrer-Policy', 'same-origin'],
				['X-Frame-Options', 'DENY'],
				['Cache-Control', 'no-cache']
			]);

			const certificate = headers.find(([header, _]) => header === 'IC-Certificate');

			expect(certificate).not.toBeUndefined();

			const [_, value] = certificate as [string, string];
			expect(value.substring(value.indexOf('tree=:'))).toEqual(
				'tree=:2dn3gwGDAktodHRwX2Fzc2V0c4MBggRYIDmN5doHXoiKCtNGBOZIdmQ+WGqYjcmdRB1MPuJBK2oXgwJLL2hlbGxvLmh0bWyCA1ggA+5m8UUpFrT5GlBMHpur+iAbbWTCaoKyzwPD7UnZFYWCBFggqaxo4lOdUyS+X9luPEzOoyC9c2+ICLLJ6ogdBRYOj+8=:'
			);

			const decoder = new TextDecoder();
			expect(decoder.decode(body as ArrayBuffer)).toEqual(HTML);
		});

		describe.each(['/.well-known/ic-domains', '/.well-known/ii-alternative-origins'])(
			'Assertion',
			(full_path) => {
				it(`should throw errors on upload ${full_path}`, async () => {
					const { init_asset_upload } = actor;

					await expect(
						init_asset_upload({
							collection: '#dapp',
							description: toNullable(),
							encoding_type: [],
							full_path,
							name: 'ic-domains',
							token: toNullable()
						})
					).rejects.toThrow(`${full_path} is a reserved asset.`);
				});
			}
		);

		describe.each([{ memory: { Heap: null } }, { memory: { Stable: null } }])(
			'With collection',
			({ memory }) => {
				const collection = `test_${'Heap' in memory ? 'heap' : 'stable'}`;

				it('should create a collection', async () => {
					const { set_rule, list_rules } = actor;

					const setRule: SetRule = {
						memory: toNullable(memory),
						max_size: toNullable(),
						max_capacity: toNullable(),
						read: { Managed: null },
						mutable_permissions: toNullable(),
						write: { Managed: null },
						version: toNullable(),
						rate_config: toNullable()
					};

					await set_rule({ Storage: null }, collection, setRule);

					const collectionResults = await list_rules({
						Storage: null
					});

					const collectionResult = collectionResults.find(([c, _]) => c === collection);

					expect(collectionResult).not.toBeUndefined();

					const [_, { memory: memoryResult, version, created_at, updated_at, read, write }] =
						collectionResult!;

					expect(memoryResult).toEqual(toNullable(memory));
					expect(read).toEqual({ Managed: null });
					expect(write).toEqual({ Managed: null });
					expect(created_at).toBeGreaterThan(0n);
					expect(updated_at).toBeGreaterThan(0n);
					expect(fromNullable(version) ?? 0n).toBeGreaterThan(0n);
				});

				it('should throw error if path not prefixed with collection', async () => {
					const { init_asset_upload } = actor;

					await expect(
						init_asset_upload({
							collection,
							description: toNullable(),
							encoding_type: [],
							full_path: '/hello.html',
							name: 'hello.html',
							token: toNullable()
						})
					).rejects.toThrow('Asset path must be prefixed with collection key.');
				});

				it('should deploy asset', async () => {
					const { http_request } = actor;

					const name = 'hello.html';
					const full_path = `/${collection}/${name}`;

					await upload({ full_path, name, collection });

					const { headers, body } = await http_request({
						body: [],
						certificate_version: toNullable(),
						headers: [],
						method: 'GET',
						url: `/${collection}/hello.html`
					});

					const rest = headers.filter(([header, _]) => header !== 'IC-Certificate');

					expect(rest).toEqual([
						['accept-ranges', 'bytes'],
						['etag', '"03ee66f1452916b4f91a504c1e9babfa201b6d64c26a82b2cf03c3ed49d91585"'],
						['X-Content-Type-Options', 'nosniff'],
						['Strict-Transport-Security', 'max-age=31536000 ; includeSubDomains'],
						['Referrer-Policy', 'same-origin'],
						['X-Frame-Options', 'DENY'],
						['Cache-Control', 'no-cache']
					]);

					const certificate = headers.find(([header, _]) => header === 'IC-Certificate');

					expect(certificate).not.toBeUndefined();

					const [_, value] = certificate as [string, string];
					expect(value.substring(value.indexOf('tree=:'))).toEqual(
						'Heap' in memory
							? 'tree=:2dn3gwGDAktodHRwX2Fzc2V0c4MBggRYIDmN5doHXoiKCtNGBOZIdmQ+WGqYjcmdRB1MPuJBK2oXgwGCBFggt7tI5llYugLZXRndu2mmTmaNLbDM2eqISxM1gx67GwmDAYIEWCDEVEc4ahc6i6xmd9dtC3pC/IyxtWlOSwhqEXoadQkFaYMCVS90ZXN0X2hlYXAvaGVsbG8uaHRtbIIDWCAD7mbxRSkWtPkaUEwem6v6IBttZMJqgrLPA8PtSdkVhYIEWCDFugcAM49e3AzOhjYl0yM44iKyWE3AhTjwyDEvXJIBSg==:'
							: 'tree=:2dn3gwGDAktodHRwX2Fzc2V0c4MBggRYIMRURzhqFzqLrGZ3120LekL8jLG1aU5LCGoRehp1CQVpgwGCBFggyTghlH7DR1YspmeTEIgVRAhMyez5Qc69yCfwJwbRv2ODAYIEWCCwXgjjstWy8ZsWgsocF8UA1sXH9TrGaPSZSS7eP0T9sYMCVy90ZXN0X3N0YWJsZS9oZWxsby5odG1sggNYIAPuZvFFKRa0+RpQTB6bq/ogG21kwmqCss8Dw+1J2RWFggRYIG0xIVQMYLbFiFp7+GtLirVS/jAQ4pfd52Uc+oSPPc2b:'
					);

					const decoder = new TextDecoder();
					expect(decoder.decode(body as ArrayBuffer)).toEqual(HTML);
				});

				it('should not delete other collection assets', async () => {
					const { get_asset, del_assets } = actor;

					await del_assets('#dapp');

					const assetUploaded = await get_asset(collection, `/${collection}/hello.html`);
					expect(fromNullable(assetUploaded)).not.toBeUndefined();
				});

				it('should increment version of asset on update', async () => {
					const { get_asset } = actor;

					const name = 'update.html';
					const full_path = `/${collection}/${name}`;

					await upload({ full_path, name, collection });

					const asset = fromNullable(await get_asset(collection, full_path));

					expect(asset).not.toBeUndefined();
					expect(fromNullable(asset!.version) ?? 0n).toEqual(1n);

					await upload({ full_path, name, collection });

					const updatedAsset = fromNullable(await get_asset(collection, full_path));

					expect(updatedAsset).not.toBeUndefined();
					expect(fromNullable(updatedAsset!.version) ?? 0n).toEqual(2n);
				});

				it('should delete asset', async () => {
					const { del_asset, get_asset } = actor;

					const full_path = `/${collection}/update.html`;

					await expect(del_asset(collection, full_path)).resolves.not.toThrowError();

					const asset = fromNullable(await get_asset(collection, full_path));

					expect(asset).toBeUndefined();
				});
			}
		);

		describe('Rewrite', () => {
			it('should rewrite to index.html per default if not found', async () => {
				const { http_request, commit_asset_upload, upload_asset_chunk, init_asset_upload } = actor;

				const file = await init_asset_upload({
					collection: '#dapp',
					description: toNullable(),
					encoding_type: [],
					full_path: '/index.html',
					name: 'index.html',
					token: toNullable()
				});

				const HTML = '<html><body>Index</body></html>';

				const blob = new Blob([HTML], {
					type: 'text/plain; charset=utf-8'
				});

				const chunk = await upload_asset_chunk({
					batch_id: file.batch_id,
					content: arrayBufferToUint8Array(await blob.arrayBuffer()),
					order_id: [0n]
				});

				await commit_asset_upload({
					batch_id: file.batch_id,
					chunk_ids: [chunk.chunk_id],
					headers: []
				});

				const { status_code, body } = await http_request({
					body: [],
					certificate_version: toNullable(),
					headers: [],
					method: 'GET',
					url: '/unknown.html'
				});

				expect(status_code).toEqual(200);

				const decoder = new TextDecoder();
				expect(decoder.decode(body as ArrayBuffer)).toEqual(HTML);
			});

			it('should set a config for a rewrite and redirect', async () => {
				const { set_storage_config, get_config } = actor;

				const storage: StorageConfig = {
					headers: [['*', [['Cache-Control', 'no-cache']]]],
					iframe: toNullable({ Deny: null }),
					redirects: [
						[
							[
								'/*',
								{
									location: '/hello.html',
									status_code: 302
								}
							]
						]
					],
					rewrites: [['/hello.html', '/hello.html']],
					raw_access: toNullable(),
					max_memory_size: toNullable()
				};

				await set_storage_config(storage);

				const configs = await get_config();

				expect(configs).toEqual({
					storage,
					authentication: toNullable(),
					db: toNullable()
				});
			});
		});
	});

	describe('routing', () => {
		const collection = '#dapp';
		const HTML = '<html><body>Hello</body></html>';

		const blob = new Blob([HTML], {
			type: 'text/plain; charset=utf-8'
		});

		const full_path = '/index.html';

		beforeAll(async () => {
			actor.setIdentity(controller);

			const { init_asset_upload, upload_asset_chunk, commit_asset_upload } = actor;

			const file = await init_asset_upload({
				collection,
				description: toNullable(),
				encoding_type: [],
				full_path,
				name: full_path,
				token: toNullable()
			});

			const chunk = await upload_asset_chunk({
				batch_id: file.batch_id,
				content: arrayBufferToUint8Array(await blob.arrayBuffer()),
				order_id: [0n]
			});

			await commit_asset_upload({
				batch_id: file.batch_id,
				chunk_ids: [chunk.chunk_id],
				headers: []
			});
		});

		describe('raw', () => {
			describe.each(['icp0.io', 'ic0.app', 'icp-api.io', 'internetcomputer.org'])(
				`Disable raw %s`,
				(domain) => {
					it('should not be able to access on raw per default', async () => {
						const { http_request } = actor;

						const { status_code } = await http_request({
							body: [],
							certificate_version: toNullable(),
							headers: [['Host', `${canisterId.toText()}.raw.${domain}`]],
							method: 'GET',
							url: '/hello.html'
						});

						expect(status_code).toEqual(308);
					});
				}
			);

			it('should be able to access on raw if allowed', async () => {
				const { http_request, set_storage_config } = actor;

				const storage: StorageConfig = {
					headers: [],
					iframe: toNullable(),
					redirects: [],
					rewrites: [],
					raw_access: toNullable({ Allow: null }),
					max_memory_size: toNullable()
				};

				await set_storage_config(storage);

				const { status_code, body } = await http_request({
					body: [],
					certificate_version: toNullable(),
					headers: [['Host', `${canisterId.toText()}.raw.icp0.io`]],
					method: 'GET',
					url: '/hello.html'
				});

				expect(status_code).toEqual(200);

				const decoder = new TextDecoder();
				expect(decoder.decode(body as ArrayBuffer)).toEqual(HTML);
			});

			it('should not be able to access on raw if explicitly disabled', async () => {
				const { http_request, set_storage_config } = actor;

				const storage: StorageConfig = {
					headers: [],
					iframe: toNullable(),
					redirects: [],
					rewrites: [],
					raw_access: toNullable({ Deny: null }),
					max_memory_size: toNullable()
				};

				await set_storage_config(storage);

				const { status_code } = await http_request({
					body: [],
					certificate_version: toNullable(),
					headers: [['Host', `${canisterId.toText()}.raw.icp0.io`]],
					method: 'GET',
					url: '/hello.html'
				});

				expect(status_code).toEqual(308);
			});

			it('should be able to access content if not raw', async () => {
				const { http_request, set_storage_config } = actor;

				const storage: StorageConfig = {
					headers: [],
					iframe: toNullable(),
					redirects: [],
					rewrites: [],
					raw_access: toNullable({ Allow: null }),
					max_memory_size: toNullable()
				};

				await set_storage_config(storage);

				const { status_code, body } = await http_request({
					body: [],
					certificate_version: toNullable(),
					headers: toNullable(),
					method: 'GET',
					url: '/hello.html'
				});

				expect(status_code).toEqual(200);

				const decoder = new TextDecoder();
				expect(decoder.decode(body as ArrayBuffer)).toEqual(HTML);
			});
		});
	});

	const user = Ed25519KeyIdentity.generate();
	const user2 = Ed25519KeyIdentity.generate();

	describe('user', () => {
		beforeAll(async () => {
			const { set_doc } = actor;

			actor.setIdentity(user);

			await set_doc('#user', user.getPrincipal().toText(), {
				data: await toArray({
					provider: 'internet_identity'
				}),
				description: toNullable(),
				version: toNullable()
			});

			actor.setIdentity(user2);

			await set_doc('#user', user2.getPrincipal().toText(), {
				data: await toArray({
					provider: 'internet_identity'
				}),
				description: toNullable(),
				version: toNullable()
			});
		});

		describe.each([{ memory: { Heap: null } }, { memory: { Stable: null } }])(
			'With memory %s',
			({ memory }) => {
				const collection = 'Heap' in memory ? 'images_heap' : 'images_stable';

				beforeAll(async () => {
					actor.setIdentity(controller);

					const { set_rule } = actor;

					const setRule: SetRule = {
						memory: toNullable(memory),
						max_size: toNullable(),
						max_capacity: toNullable(),
						read: { Managed: null },
						mutable_permissions: toNullable(),
						write: { Managed: null },
						version: toNullable(),
						rate_config: toNullable()
					};

					await set_rule({ Storage: null }, collection, setRule);

					actor.setIdentity(user);
				});

				const SVG =
					'<svg height="100" width="100"><circle r="45" cx="50" cy="50" fill="red" /></svg>';

				const uploadCustomAsset = async (name = 'hello.svg') => {
					const { commit_asset_upload, upload_asset_chunk, init_asset_upload } = actor;

					const file = await init_asset_upload({
						collection,
						description: toNullable(),
						encoding_type: [],
						full_path: `/${collection}/${name}`,
						name,
						token: toNullable()
					});

					const blob = new Blob([SVG], {
						type: 'text/plain; charset=utf-8'
					});

					const chunk = await upload_asset_chunk({
						batch_id: file.batch_id,
						content: arrayBufferToUint8Array(await blob.arrayBuffer()),
						order_id: [0n]
					});

					await commit_asset_upload({
						batch_id: file.batch_id,
						chunk_ids: [chunk.chunk_id],
						headers: []
					});
				};

				it('should upload custom asset', async () => {
					const { http_request } = actor;

					await uploadCustomAsset();

					const { body } = await http_request({
						body: [],
						certificate_version: toNullable(),
						headers: [],
						method: 'GET',
						url: `/${collection}/hello.svg`
					});

					const decoder = new TextDecoder();
					expect(decoder.decode(body as ArrayBuffer)).toEqual(SVG);
				});

				it('should not change owner if controller overwrite asset', async () => {
					actor.setIdentity(controller);

					const { get_asset } = actor;

					await uploadCustomAsset();

					const assetUpdated = fromNullable(
						await get_asset(collection, `/${collection}/hello.svg`)
					);
					expect(assetUpdated).not.toBeUndefined();
					expect(assetUpdated?.key.owner.toText()).not.toBeUndefined();
					expect(assetUpdated?.key.owner.toText()).toEqual(user.getPrincipal().toText());
				});

				it('should delete asset', async () => {
					actor.setIdentity(user);

					const { get_asset, del_asset } = actor;

					await del_asset(collection, `/${collection}/hello.svg`);

					const assetDeleted = fromNullable(
						await get_asset(collection, `/${collection}/hello.svg`)
					);

					expect(assetDeleted).toBeUndefined();
				});

				describe('list', () => {
					beforeAll(async () => {
						for (const i of Array.from({ length: 10 }).map((_, i) => i)) {
							await uploadCustomAsset(`hello-${i}.svg`);
							await pic.advanceTime(100);
						}
					});

					it('should list assets according created_at timestamps', async () => {
						const { list_assets, count_assets } = actor;

						const paramsCreatedAt: ListParams = {
							matcher: toNullable(),
							order: toNullable({
								desc: false,
								field: { CreatedAt: null }
							}),
							owner: toNullable(),
							paginate: toNullable()
						};

						const { items_length, items } = await list_assets(collection, paramsCreatedAt);
						expect(items_length).toBe(10n);

						const countCreatedAt = await count_assets(collection, paramsCreatedAt);
						expect(countCreatedAt).toBe(10n);

						const paramsGreaterThan: ListParams = {
							matcher: toNullable({
								key: toNullable(),
								description: toNullable(),
								created_at: toNullable({
									GreaterThan: items[4][1].created_at
								}),
								updated_at: toNullable()
							}),
							order: toNullable(),
							owner: toNullable(),
							paginate: toNullable()
						};

						const { items_length: items_length_from } = await list_assets(
							collection,
							paramsGreaterThan
						);
						expect(items_length_from).toBe(5n);

						const countGreaterThan = await count_assets(collection, paramsGreaterThan);
						expect(countGreaterThan).toBe(5n);

						const paramsLessThan: ListParams = {
							matcher: toNullable({
								key: toNullable(),
								description: toNullable(),
								created_at: toNullable({
									LessThan: items[4][1].created_at
								}),
								updated_at: toNullable()
							}),
							order: toNullable(),
							owner: toNullable(),
							paginate: toNullable()
						};

						const { items_length: items_length_to } = await list_assets(collection, paramsLessThan);
						expect(items_length_to).toBe(4n);

						const countLessThan = await count_assets(collection, paramsLessThan);
						expect(countLessThan).toBe(4n);

						const paramsBetween: ListParams = {
							matcher: toNullable({
								key: toNullable(),
								description: toNullable(),
								created_at: toNullable({
									Between: [items[4][1].created_at, items[8][1].created_at]
								}),
								updated_at: toNullable()
							}),
							order: toNullable(),
							owner: toNullable(),
							paginate: toNullable()
						};

						const { items_length: items_length_between } = await list_assets(
							collection,
							paramsBetween
						);
						expect(items_length_between).toBe(5n);

						const countBetween = await count_assets(collection, paramsBetween);
						expect(countBetween).toBe(5n);
					});

					it('should list assets according updated_at timestamps', async () => {
						const { list_assets, count_assets } = actor;

						const paramsUpdatedAt: ListParams = {
							matcher: toNullable(),
							order: toNullable({
								desc: false,
								field: { UpdatedAt: null }
							}),
							owner: toNullable(),
							paginate: toNullable()
						};

						const { items_length, items } = await list_assets(collection, paramsUpdatedAt);
						expect(items_length).toBe(10n);

						const countUpdatedAt = await count_assets(collection, paramsUpdatedAt);
						expect(countUpdatedAt).toBe(10n);

						const paramsGreaterThan: ListParams = {
							matcher: toNullable({
								key: toNullable(),
								description: toNullable(),
								updated_at: toNullable({
									GreaterThan: items[4][1].created_at
								}),
								created_at: toNullable()
							}),
							order: toNullable(),
							owner: toNullable(),
							paginate: toNullable()
						};

						const { items_length: items_length_from } = await list_assets(
							collection,
							paramsGreaterThan
						);
						expect(items_length_from).toBe(5n);

						const countGreaterThan = await count_assets(collection, paramsGreaterThan);
						expect(countGreaterThan).toBe(5n);

						const paramsLessThan: ListParams = {
							matcher: toNullable({
								key: toNullable(),
								description: toNullable(),
								updated_at: toNullable({
									LessThan: items[4][1].created_at
								}),
								created_at: toNullable()
							}),
							order: toNullable(),
							owner: toNullable(),
							paginate: toNullable()
						};

						const { items_length: items_length_to } = await list_assets(collection, paramsLessThan);
						expect(items_length_to).toBe(4n);

						const countLessThan = await count_assets(collection, paramsLessThan);
						expect(countLessThan).toBe(4n);

						const paramsBetween: ListParams = {
							matcher: toNullable({
								key: toNullable(),
								description: toNullable(),
								updated_at: toNullable({
									Between: [items[4][1].created_at, items[8][1].created_at]
								}),
								created_at: toNullable()
							}),
							order: toNullable(),
							owner: toNullable(),
							paginate: toNullable()
						};

						const { items_length: items_length_between } = await list_assets(
							collection,
							paramsBetween
						);
						expect(items_length_between).toBe(5n);

						const countBetween = await count_assets(collection, paramsBetween);
						expect(countBetween).toBe(5n);
					});
				});

				describe('delete filtered', () => {
					it('should delete assets based on filter criteria', async () => {
						const { del_filtered_assets, list_assets } = actor;

						await uploadCustomAsset('asset1.svg');
						await uploadCustomAsset('asset2.svg');
						await uploadCustomAsset('asset3.svg');

						const filterParams: ListParams = {
							matcher: toNullable({
								key: toNullable('/asset2\\.svg$'),
								description: toNullable(),
								created_at: toNullable(),
								updated_at: toNullable()
							}),
							order: toNullable({
								desc: true,
								field: { Keys: null }
							}),
							owner: toNullable(),
							paginate: toNullable()
						};

						const listParams: ListParams = {
							matcher: toNullable({
								key: toNullable('/asset\\d+\\.svg$'),
								description: toNullable(),
								created_at: toNullable(),
								updated_at: toNullable()
							}),
							order: toNullable({
								desc: true,
								field: { Keys: null }
							}),
							owner: toNullable(),
							paginate: toNullable()
						};

						await del_filtered_assets(collection, filterParams);

						const remainingAssets = await list_assets(collection, listParams);

						expect(remainingAssets.items.map((item) => item[1].key.full_path)).toEqual([
							`/${collection}/asset3.svg`,
							`/${collection}/asset1.svg`
						]);
					});

					it('should prevent user1 from deleting assets of user2', async () => {
						const { del_filtered_assets, list_assets } = actor;

						actor.setIdentity(user2);

						await uploadCustomAsset('user2_asset.svg');

						actor.setIdentity(user);

						const filterParams: ListParams = {
							matcher: toNullable({
								key: toNullable('/asset1\\.svg$'),
								description: toNullable(),
								created_at: toNullable(),
								updated_at: toNullable()
							}),
							order: toNullable({
								desc: true,
								field: { Keys: null }
							}),
							owner: toNullable(),
							paginate: toNullable()
						};

						await del_filtered_assets(collection, filterParams);

						const listParams: ListParams = {
							matcher: toNullable({
								key: toNullable('/asset\\d+\\.svg$'),
								description: toNullable(),
								created_at: toNullable(),
								updated_at: toNullable()
							}),
							order: toNullable({
								desc: true,
								field: { Keys: null }
							}),
							owner: toNullable(),
							paginate: toNullable()
						};

						const remainingAssets = await list_assets(collection, listParams);
						expect(remainingAssets.items.map((item) => item[1].key.full_path)).toEqual([
							`/${collection}/asset3.svg`
						]);

						const listParamsUser2: ListParams = {
							matcher: toNullable({
								key: toNullable('/user2_asset\\.svg$'),
								description: toNullable(),
								created_at: toNullable(),
								updated_at: toNullable()
							}),
							order: toNullable({
								desc: true,
								field: { Keys: null }
							}),
							owner: toNullable(),
							paginate: toNullable()
						};

						actor.setIdentity(user2);

						const user2Assets = await list_assets(collection, listParamsUser2);
						expect(user2Assets.items.map((item) => item[1].key.full_path)).toEqual([
							`/${collection}/user2_asset.svg`
						]);

						actor.setIdentity(user);
					});

					it('should delete assets as controller if filtered delete is used', async () => {
						const { del_filtered_assets, list_assets } = actor;

						actor.setIdentity(controller);

						const filterParams: ListParams = {
							matcher: toNullable({
								key: toNullable('/user2_asset\\.svg$'),
								description: toNullable(),
								created_at: toNullable(),
								updated_at: toNullable()
							}),
							order: toNullable(),
							owner: toNullable(),
							paginate: toNullable()
						};

						await del_filtered_assets(collection, filterParams);

						const listParams: ListParams = {
							matcher: toNullable(),
							order: toNullable(),
							owner: toNullable(),
							paginate: toNullable()
						};

						actor.setIdentity(user2);

						const user2Assets = await list_assets(collection, listParams);

						expect(user2Assets.items_length).toEqual(0n);

						actor.setIdentity(user);

						const remainingAssets = await list_assets(collection, listParams);
						expect(remainingAssets.items_length).toBeGreaterThan(0n);
					});
				});
			}
		);
	});

	describe('collection', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should not delete not empty collection', async () => {
			const { del_rule } = actor;

			const collection = 'images_heap';

			try {
				await del_rule({ Storage: null }, collection, { version: [1n] });

				expect(true).toBe(false);
			} catch (error: unknown) {
				expect((error as Error).message).toContain(
					`The "${collection}" collection in Storage is not empty.`
				);
			}
		});

		it('should not upload file in existing collection', async () => {
			const collectionUnknown = 'unknown';

			try {
				await upload({
					full_path: `/${collectionUnknown}/hello.html`,
					name: 'hello.html',
					collection: collectionUnknown
				});

				expect(true).toBe(false);
			} catch (error: unknown) {
				expect((error as Error).message).toContain(
					`Collection "${collectionUnknown}" not found in Storage.`
				);
			}
		});
	});

	describe('More configuration', () => {
		const maxHeapMemorySize = 3_932_160n;
		const maxStableMemorySize = 2_000_000n;

		beforeAll(() => {
			actor.setIdentity(controller);
		});

		describe.each([
			{
				memory: { Heap: null },
				expectMemory: 3_997_696n,
				allowedMemory: maxHeapMemorySize,
				preUploadCount: 13
			},
			{
				memory: { Stable: null },
				expectMemory: 25_231_360n,
				allowedMemory: maxStableMemorySize,
				preUploadCount: 0
			}
		])('With collection', ({ memory, expectMemory, allowedMemory, preUploadCount }) => {
			const collection = `test_${'Heap' in memory ? 'heap' : 'stable'}`;

			const errorMsg = `${'Heap' in memory ? 'Heap' : 'Stable'} memory usage exceeded: ${expectMemory} bytes used, ${allowedMemory} bytes allowed.`;

			const HTML = readFileSync(join(process.cwd(), 'src/frontend/src/app.html'));

			const blob = new Blob([HTML], {
				type: 'text/plain; charset=utf-8'
			});

			const upload = async ({ full_path, name }: { full_path: string; name: string }) => {
				const { commit_asset_upload, upload_asset_chunk, init_asset_upload } = actor;

				const file = await init_asset_upload({
					collection,
					description: toNullable(),
					encoding_type: [],
					full_path,
					name,
					token: toNullable()
				});

				const chunk = await upload_asset_chunk({
					batch_id: file.batch_id,
					content: arrayBufferToUint8Array(await blob.arrayBuffer()),
					order_id: [0n]
				});

				await commit_asset_upload({
					batch_id: file.batch_id,
					chunk_ids: [chunk.chunk_id],
					headers: []
				});
			};

			const preUpload = async () => {
				if (preUploadCount === 0) {
					return;
				}

				for (const i of Array.from({ length: preUploadCount }).map((_, i) => i)) {
					await upload({ full_path: `/${collection}/hello${i}.html`, name: `hello${i}.html` });
				}
			};

			beforeAll(async () => {
				await preUpload();
			});

			const configMaxMemory = async (max: 'heap' | 'stable' | 'none') => {
				const { set_storage_config } = actor;

				const storage: StorageConfig = {
					headers: [['*', [['Cache-Control', 'no-cache']]]],
					iframe: toNullable({ Deny: null }),
					redirects: [],
					rewrites: [],
					raw_access: toNullable(),
					max_memory_size: toNullable({
						heap: max === 'heap' ? [maxHeapMemorySize] : [],
						stable: max === 'stable' ? [maxStableMemorySize] : []
					})
				};

				await set_storage_config(storage);
			};

			describe('should limit max memory size', () => {
				const name = 'more_data.html';
				const full_path = `/${collection}/${name}`;

				it('should not allow to create a batch', async () => {
					await configMaxMemory('Heap' in memory ? 'heap' : 'stable');

					const { init_asset_upload } = actor;

					await expect(
						init_asset_upload({
							collection,
							description: toNullable(),
							encoding_type: [],
							full_path,
							name,
							token: toNullable()
						})
					).rejects.toThrow(errorMsg);
				});

				it('should not allow to upload a chunk', async () => {
					const { upload_asset_chunk, init_asset_upload } = actor;

					await configMaxMemory('none');

					const { batch_id } = await init_asset_upload({
						collection,
						description: toNullable(),
						encoding_type: [],
						full_path,
						name,
						token: toNullable()
					});

					await configMaxMemory('Heap' in memory ? 'heap' : 'stable');

					await expect(
						upload_asset_chunk({
							batch_id,
							content: arrayBufferToUint8Array(await blob.arrayBuffer()),
							order_id: [0n]
						})
					).rejects.toThrow(errorMsg);
				});

				it('should not allow to commit a batch', async () => {
					const { commit_asset_upload, init_asset_upload, upload_asset_chunk } = actor;

					await configMaxMemory('none');

					const { batch_id } = await init_asset_upload({
						collection,
						description: toNullable(),
						encoding_type: [],
						full_path,
						name,
						token: toNullable()
					});

					const { chunk_id } = await upload_asset_chunk({
						batch_id,
						content: arrayBufferToUint8Array(await blob.arrayBuffer()),
						order_id: [0n]
					});

					await configMaxMemory('Heap' in memory ? 'heap' : 'stable');

					await expect(
						commit_asset_upload({
							batch_id,
							chunk_ids: [chunk_id],
							headers: []
						})
					).rejects.toThrow(errorMsg);
				});
			});
		});
	});
});
