import type {
	_SERVICE as SatelliteActor,
	SetRule,
	StorageConfig
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { arrayBufferToUint8Array, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { parse } from '@ltd/j-toml';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect } from 'vitest';
import { WASM_PATH, satelliteInitArgs } from './utils/satellite-tests.utils';

describe('Satellite', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create();

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: WASM_PATH,
			arg: satelliteInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setRule: SetRule = {
		memory: toNullable(),
		updated_at: toNullable(),
		max_size: toNullable(),
		read: { Managed: null },
		mutable_permissions: toNullable(),
		write: { Managed: null }
	};

	let testRuleUpdatedAt: bigint | undefined;

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should create a collection', async () => {
			const { set_rule, list_rules } = actor;

			await set_rule({ Db: null }, 'test', setRule);

			const [[collection, { memory, created_at, updated_at, read, write }], _] = await list_rules({
				Db: null
			});

			expect(collection).toEqual('test');
			expect(memory).toEqual(toNullable({ Heap: null }));
			expect(read).toEqual({ Managed: null });
			expect(write).toEqual({ Managed: null });
			expect(created_at).toBeGreaterThan(0n);
			expect(updated_at).toBeGreaterThan(0n);

			testRuleUpdatedAt = updated_at;
		});

		it('should list collections', async () => {
			const { list_rules } = actor;

			const [
				[collection, { updated_at, created_at, memory, mutable_permissions, read, write }],
				_
			] = await list_rules({ Db: null });

			expect(collection).toEqual('test');
			expect(memory).toEqual(toNullable({ Heap: null }));
			expect(read).toEqual({ Managed: null });
			expect(write).toEqual({ Managed: null });
			expect(mutable_permissions).toEqual([true]);
			expect(created_at).toBeGreaterThan(0n);
			expect(updated_at).toBeGreaterThan(0n);
		});

		it('should add and remove collections', async () => {
			const { list_rules, set_rule, del_rule } = actor;

			await set_rule({ Db: null }, 'test2', setRule);

			const rules = await list_rules({ Db: null });
			expect(rules).toHaveLength(2);

			const [_, { updated_at }] = rules[1];

			await del_rule({ Db: null }, 'test2', {
				updated_at: toNullable(updated_at)
			});

			expect(await list_rules({ Db: null })).toHaveLength(1);
		});

		it('should add and remove additional controller', async () => {
			const { set_controllers, del_controllers, list_controllers } = actor;

			const newController = Ed25519KeyIdentity.generate();

			const controllers = await set_controllers({
				controllers: [newController.getPrincipal()],
				controller: {
					expires_at: toNullable(),
					metadata: [],
					scope: { Admin: null }
				}
			});

			expect(controllers).toHaveLength(2);

			expect(
				controllers.find(([p]) => p.toText() === controller.getPrincipal().toText())
			).not.toBeUndefined();

			expect(
				controllers.find(([p]) => p.toText() === newController.getPrincipal().toText())
			).not.toBeUndefined();

			await del_controllers({
				controllers: [newController.getPrincipal()]
			});

			const updatedControllers = await list_controllers();
			expect(updatedControllers).toHaveLength(1);
			expect(updatedControllers[0][0].toText()).toEqual(controller.getPrincipal().toText());
		});

		it('should set and get config', async () => {
			const { set_config, get_config } = actor;

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
				rewrites: [['/hello.html', '/hello.html']]
			};

			await set_config({
				storage
			});

			const configs = await get_config();

			expect(configs).toEqual({
				storage
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
				'tree=:2dn3gwGDAktodHRwX2Fzc2V0c4MBggRYIDmN5doHXoiKCtNGBOZIdmQ+WGqYjcmdRB1MPuJBK2oXgwJLL2hlbGxvLmh0bWyCA1ggA+5m8UUpFrT5GlBMHpur+iAbbWTCaoKyzwPD7UnZFYWCBFggu+vgJ40baoH6QaigqUGb3VrUkopUK4LJuugRxX7g6qc=:'
			);

			const decoder = new TextDecoder();
			expect(decoder.decode(body as ArrayBuffer)).toEqual(HTML);
		});

		it('should add and remove custom domain', async () => {
			const { list_custom_domains, del_custom_domain, set_custom_domain } = actor;

			await set_custom_domain('hello.com', toNullable('12345'));

			const domains = await list_custom_domains();
			expect(domains[0][0]).toEqual('hello.com');
			expect(domains[0][1].bn_id).toEqual(toNullable('12345'));

			await set_custom_domain('world.com', toNullable());
			expect(await list_custom_domains()).toHaveLength(2);

			await del_custom_domain('world.com');
			const result = await list_custom_domains();
			expect(result).toHaveLength(1);
			expect(result[0][0]).toEqual('hello.com');
		});

		it('should expose /.well-known/ic-domains', async () => {
			const { http_request } = actor;

			const { body } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ic-domains'
			});

			const decoder = new TextDecoder();
			expect(decoder.decode(body as ArrayBuffer)).toEqual('hello.com');
		});
	});

	describe('admin guard', () => {
		const user = Ed25519KeyIdentity.generate();

		const ADMIN_ERROR_MSG = 'Caller is not an admin controller of the satellite.';
		const CONTROLLER_ERROR_MSG = 'Caller is not a controller of the satellite.';

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should throw errors on creating collections', async () => {
			const { set_rule } = actor;

			await expect(set_rule({ Db: null }, 'user-test', setRule)).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on list collections', async () => {
			const { list_rules } = actor;

			await expect(list_rules({ Db: null })).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting collections', async () => {
			const { del_rule } = actor;

			await expect(
				del_rule({ Db: null }, 'test', { updated_at: toNullable(testRuleUpdatedAt) })
			).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on creating controller', async () => {
			const { set_controllers } = actor;

			const controller = Ed25519KeyIdentity.generate();

			await expect(
				set_controllers({
					controllers: [controller.getPrincipal()],
					controller: {
						expires_at: toNullable(),
						metadata: [],
						scope: { Admin: null }
					}
				})
			).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on list controllers', async () => {
			const { list_controllers } = actor;

			await expect(list_controllers()).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting controller', async () => {
			const { del_controllers } = actor;

			await expect(
				del_controllers({
					controllers: [controller.getPrincipal()]
				})
			).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on setting config', async () => {
			const { set_config } = actor;

			await expect(
				set_config({
					storage: {
						headers: [],
						iframe: toNullable(),
						redirects: toNullable(),
						rewrites: []
					}
				})
			).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on getting config', async () => {
			const { get_config } = actor;

			await expect(get_config()).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on setting custom domain', async () => {
			const { set_custom_domain } = actor;

			await expect(set_custom_domain('hello.com', toNullable())).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on listing custom domains', async () => {
			const { list_custom_domains } = actor;

			await expect(list_custom_domains()).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting custom domains', async () => {
			const { del_custom_domain } = actor;

			await expect(del_custom_domain('hello.com')).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on deleting docs', async () => {
			const { del_docs } = actor;

			await expect(del_docs('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on counting docs', async () => {
			const { count_docs } = actor;

			await expect(count_docs('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on deleting assets', async () => {
			const { del_assets } = actor;

			await expect(del_assets('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on counting assets', async () => {
			const { count_assets } = actor;

			await expect(count_assets('test')).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on deposit cycles', async () => {
			const { deposit_cycles } = actor;

			await expect(
				deposit_cycles({
					cycles: 123n,
					destination_id: user.getPrincipal()
				})
			).rejects.toThrow(ADMIN_ERROR_MSG);
		});

		it('should throw errors on getting memory size', async () => {
			const { memory_size } = actor;

			await expect(memory_size()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on trying to deploy dapp', async () => {
			const { init_asset_upload } = actor;

			await expect(
				init_asset_upload({
					collection: '#dapp',
					description: toNullable(),
					encoding_type: [],
					full_path: '/hello.html',
					name: 'hello.html',
					token: toNullable()
				})
			).rejects.toThrow('Caller not allowed to upload data.');
		});
	});

	describe('user', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should create a user', async () => {
			const { set_doc, list_docs } = actor;

			await set_doc('#user', user.getPrincipal().toText(), {
				data: await toArray({
					provider: 'internet_identity'
				}),
				description: toNullable(),
				updated_at: toNullable()
			});

			const { items: users } = await list_docs('#user', {
				matcher: toNullable(),
				order: toNullable(),
				owner: toNullable(),
				paginate: toNullable()
			});

			expect(users).toHaveLength(1);
			expect(users.find(([key]) => key === user.getPrincipal().toText())).not.toBeUndefined();
		});
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should create a user', async () => {
			const { set_doc } = actor;

			const user = Ed25519KeyIdentity.generate();

			await expect(
				set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					updated_at: toNullable()
				})
			).rejects.toThrow('Cannot write.');
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

	describe('public', () => {
		it('should expose version of the consumer', async () => {
			const tomlFile = readFileSync(join(process.cwd(), 'src', 'satellite', 'Cargo.toml'));

			type Toml = { package: { version: string } } | undefined;

			const result: Toml = parse(tomlFile.toString()) as unknown as Toml;

			expect(result?.package?.version).not.toBeNull();

			expect(await actor.version()).toEqual(result?.package?.version);
		});
	});
});
