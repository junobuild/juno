import type {
	_SERVICE as SatelliteActor_0_0_16,
	SetDoc as SetDoc0_0_16,
	SetRule as SetRule0_0_16
} from '$declarations/deprecated/satellite-0-0-16.did';
import { idlFactory as idlFactorSatellite_0_0_16 } from '$declarations/deprecated/satellite-0-0-16.factory.did';
import type {
	_SERVICE as SatelliteActor_0_0_17,
	SetRule as SetRule0_0_17
} from '$declarations/deprecated/satellite-0-0-17.did';
import { idlFactory as idlFactorSatellite_0_0_17 } from '$declarations/deprecated/satellite-0-0-17.factory.did';
import type { _SERVICE as SatelliteActor_0_0_21 } from '$declarations/deprecated/satellite-0-0-21.did';
import { idlFactory as idlFactorSatellite_0_0_21 } from '$declarations/deprecated/satellite-0-0-21.factory.did';
import type { _SERVICE as SatelliteActor, SetDoc } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import {
	arrayBufferToUint8Array,
	assertNonNullish,
	fromNullable,
	toNullable
} from '@dfinity/utils';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import { mockData } from '../../../mocks/doc.mocks';
import { mockBlob } from '../../../mocks/storage.mocks';
import { tick } from '../../../utils/pic-tests.utils';
import {
	SATELLITE_WASM_PATH,
	controllersInitArgs,
	downloadSatellite
} from '../../../utils/setup-tests.utils';

describe('Satellite > Upgrade', () => {
	let pic: PocketIc;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	const upgradeVersion = async (version: string) => {
		await tick(pic);

		const destination = await downloadSatellite(version);

		await pic.upgradeCanister({
			canisterId,
			wasm: destination,
			sender: controller.getPrincipal()
		});
	};

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: SATELLITE_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const initUsers = async (actor: Actor<SatelliteActor_0_0_16>): Promise<Identity[]> => {
		const { set_doc } = actor;

		const user1 = Ed25519KeyIdentity.generate();

		await set_doc('#user', user1.getPrincipal().toText(), {
			data: await toArray({
				provider: 'internet_identity'
			}),
			description: toNullable(),
			updated_at: toNullable()
		});

		const user2 = Ed25519KeyIdentity.generate();

		await set_doc('#user', user2.getPrincipal().toText(), {
			data: await toArray({
				provider: 'internet_identity'
			}),
			description: toNullable(),
			updated_at: toNullable()
		});

		return [user1, user2];
	};

	const testUsers = async ({
		users,
		actor
	}: {
		users: Identity[];
		actor: Actor<SatelliteActor_0_0_16 | SatelliteActor_0_0_17 | SatelliteActor_0_0_21>;
	}) => {
		const { list_docs } = actor;

		const { items } = await list_docs('#user', {
			matcher: toNullable(),
			order: toNullable(),
			owner: toNullable(),
			paginate: toNullable()
		});

		expect(users).toHaveLength(users.length);

		for (const user of users) {
			expect(items.find(([key]) => key === user.getPrincipal().toText())).not.toBeUndefined();
		}
	};

	describe('v0.0.15 -> v0.0.16', () => {
		let actor: Actor<SatelliteActor_0_0_16>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite('0.0.15');

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor_0_0_16>({
				idlFactory: idlFactorSatellite_0_0_16,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		it(
			'should add users after upgrade and still list all users from heap',
			{
				timeout: 120000
			},
			async () => {
				await initUsers(actor);

				const users = await initUsers(actor);

				await testUsers({ users, actor });

				await upgradeVersion('0.0.16');

				const moreUsers = await initUsers(actor);

				await testUsers({ users: [...users, ...moreUsers], actor });
			}
		);

		it('should keep listing existing heap collections as such', async () => {
			const { set_rule, list_rules } = actor;

			await set_rule({ Db: null }, 'test', {
				memory: toNullable({ Heap: null }),
				updated_at: toNullable(),
				max_size: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Managed: null },
				max_capacity: toNullable()
			});

			const testCollection = async () => {
				const [[collection, { memory }], _] = await list_rules({
					Db: null
				});

				expect(collection).toEqual('test');
				expect(memory).toEqual(toNullable({ Heap: null }));
			};

			await testCollection();

			await upgradeVersion('0.0.16');

			await testCollection();
		});
	});

	describe('v0.0.11 -> v0.0.17', () => {
		let actor: Actor<SatelliteActor_0_0_16>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite('0.0.11');

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor_0_0_16>({
				idlFactory: idlFactorSatellite_0_0_16,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		it('should still list users from heap', { timeout: 600000 }, async () => {
			await initUsers(actor);

			const users = await initUsers(actor);

			await testUsers({ users, actor });

			await upgradeVersion('0.0.12');

			await testUsers({ users, actor });

			await upgradeVersion('0.0.13');

			await testUsers({ users, actor });

			await upgradeVersion('0.0.14');

			await testUsers({ users, actor });

			await upgradeVersion('0.0.15');

			await testUsers({ users, actor });

			await upgradeVersion('0.0.16');

			await testUsers({ users, actor });

			await upgradeVersion('0.0.17');

			await testUsers({ users, actor });

			await upgrade();

			await testUsers({ users, actor });
		});
	});

	describe('v0.0.16 -> v0.0.16', () => {
		let actor: Actor<SatelliteActor_0_0_16>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite('0.0.16');

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor_0_0_16>({
				idlFactory: idlFactorSatellite_0_0_16,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		it('should keep users', async () => {
			await initUsers(actor);

			const users = await initUsers(actor);

			await testUsers({ users, actor });

			await upgradeVersion('0.0.16');

			await testUsers({ users, actor });
		});
	});

	describe('v0.0.16 -> v0.0.17', () => {
		let actor: Actor<SatelliteActor_0_0_16>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite('0.0.16');

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor_0_0_16>({
				idlFactory: idlFactorSatellite_0_0_16,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		const setRule: SetRule0_0_16 = {
			memory: toNullable({ Stable: null }),
			max_size: toNullable(),
			max_capacity: toNullable(),
			read: { Managed: null },
			mutable_permissions: toNullable(true),
			write: { Managed: null },
			updated_at: toNullable()
		};

		describe('Rules', () => {
			let newActor: Actor<SatelliteActor_0_0_17>;

			beforeEach(async () => {
				const { set_rule: set_rule_deprecated } = actor as SatelliteActor_0_0_16;

				await set_rule_deprecated({ Db: null }, 'test', setRule);

				await upgradeVersion('0.0.17');

				newActor = pic.createActor<SatelliteActor_0_0_17>(idlFactorSatellite_0_0_17, canisterId);
				newActor.setIdentity(controller);
			});

			it('should add version set to none to rules', async () => {
				const { list_rules } = newActor;

				const [[collection, { version }], _] = await list_rules({ Db: null });

				expect(collection).toEqual('test');
				expect(version).toEqual(toNullable());
			});

			it('should be able to update rule after upgrade', async () => {
				const { set_rule } = newActor;

				const setUpdateRule: SetRule0_0_17 = {
					...setRule,
					version: toNullable()
				};

				await expect(set_rule({ Db: null }, 'test', setUpdateRule)).resolves.not.toThrow();
			});

			it('should be able to update rule after upgrade only once without version provided', async () => {
				const { set_rule: set_rule_deprecated } = actor as SatelliteActor_0_0_16;

				// We do not provide the version so it counts as a first set
				await set_rule_deprecated({ Db: null }, 'test', setRule);

				// We do not provide the version again so it should failed
				await expect(set_rule_deprecated({ Db: null }, 'test', setRule)).rejects.toThrow(
					'error_no_version_provided'
				);

				const { list_rules, set_rule } = newActor;

				const [[_, rule]] = await list_rules({ Db: null });

				expect(rule.version).toEqual(toNullable(1n));

				const setNewRule: SetRule0_0_17 = {
					...setRule,
					version: rule.version
				};

				// We do not provide the version so it counts as a first set
				await expect(set_rule({ Db: null }, 'test', setNewRule)).resolves.not.toThrow();
			});
		});

		describe('Documents', () => {
			const setDoc: SetDoc0_0_16 = {
				description: toNullable(),
				data: mockData,
				updated_at: toNullable()
			};

			const key = nanoid();
			const collection = 'test';

			let newActor: Actor<SatelliteActor_0_0_17>;

			beforeEach(async () => {
				const { set_rule: set_rule_deprecated } = actor as SatelliteActor_0_0_16;

				await set_rule_deprecated({ Db: null }, collection, setRule);

				const { set_doc: set_doc_deprecated } = actor as SatelliteActor_0_0_16;

				await set_doc_deprecated(collection, key, setDoc);

				await upgradeVersion('0.0.17');

				newActor = pic.createActor<SatelliteActor_0_0_17>(idlFactorSatellite_0_0_17, canisterId);
				newActor.setIdentity(controller);
			});

			it('should add version set to none to doc', async () => {
				const { get_doc } = newActor;

				const doc = fromNullable(await get_doc(collection, key));

				expect(doc).not.toBeUndefined();
				expect(doc?.version).toEqual(toNullable());
			});

			it('should be able to update doc after upgrade', async () => {
				const { set_doc } = newActor;

				const setUpdateDoc: SetDoc = {
					...setDoc,
					version: toNullable()
				};

				await expect(set_doc(collection, key, setUpdateDoc)).resolves.not.toThrow();
			});

			it('should be able to update doc after upgrade only once without version provided', async () => {
				const { set_doc: set_doc_deprecated } = actor as SatelliteActor_0_0_16;

				// We do not provide the version so it counts as a first set
				await set_doc_deprecated(collection, key, setDoc);

				// We do not provide the version again so it should failed
				await expect(set_doc_deprecated(collection, key, setDoc)).rejects.toThrow(
					'error_no_version_provided'
				);

				const { get_doc, set_doc } = newActor;

				const doc = fromNullable(await get_doc(collection, key));

				expect(doc).not.toBeUndefined();

				assertNonNullish(doc);

				expect(doc.version).toEqual(toNullable(1n));

				const setNewDoc: SetDoc = {
					...setDoc,
					version: doc.version
				};

				// We do not provide the version so it counts as a first set
				await expect(set_doc(collection, key, setNewDoc)).resolves.not.toThrow();
			});
		});

		describe('Storage', () => {
			let newActor: Actor<SatelliteActor_0_0_17>;

			describe('Custom domain', () => {
				it('should add version set to none to custom domain', async () => {
					const { set_custom_domain } = actor;

					await set_custom_domain('hello.com', ['123456']);
					await set_custom_domain('test2.com', []);

					await upgradeVersion('0.0.17');

					newActor = pic.createActor<SatelliteActor_0_0_17>(idlFactorSatellite_0_0_17, canisterId);
					newActor.setIdentity(controller);

					const { list_custom_domains } = newActor;

					const results = await list_custom_domains();

					expect(results).toHaveLength(2);

					expect(fromNullable(results[0][1].version)).toBeUndefined();
					expect(fromNullable(results[1][1].version)).toBeUndefined();
				});

				it(
					'should be able to update after upgrade and has version set',
					{ timeout: 60000 },
					async () => {
						const { set_custom_domain: set_custom_domain_deprecated } = actor;

						await set_custom_domain_deprecated('hello.com', ['123456']);

						await upgradeVersion('0.0.17');

						newActor = pic.createActor<SatelliteActor_0_0_17>(
							idlFactorSatellite_0_0_17,
							canisterId
						);
						newActor.setIdentity(controller);

						const { list_custom_domains, set_custom_domain } = newActor;

						await set_custom_domain('hello.com', ['123456']);

						const [[_, { version }]] = await list_custom_domains();

						expect(fromNullable(version)).toEqual(1n);
					}
				);
			});

			describe('Asset', () => {
				const collection = '#dapp';

				const upload = async ({
					full_path,
					actor
				}: {
					actor: Actor<SatelliteActor_0_0_17 | SatelliteActor_0_0_16>;
					full_path: string;
				}) => {
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
						content: arrayBufferToUint8Array(await mockBlob.arrayBuffer()),
						order_id: [0n]
					});

					await commit_asset_upload({
						batch_id: file.batch_id,
						chunk_ids: [chunk.chunk_id],
						headers: []
					});
				};

				it('should add version set to none to custom domain', async () => {
					await upload({ actor, full_path: `/${collection}/ugprade.html` });
					await upload({ actor, full_path: `/${collection}/ugprade2.html` });
					await upload({ actor, full_path: `/${collection}/ugprade3.html` });

					await upgradeVersion('0.0.17');

					newActor = pic.createActor<SatelliteActor_0_0_17>(idlFactorSatellite_0_0_17, canisterId);
					newActor.setIdentity(controller);

					const { list_assets } = newActor;

					const assets = await list_assets(collection, {
						matcher: [],
						order: [],
						owner: [],
						paginate: []
					});

					for (const [_, { version }] of assets.items) {
						expect(fromNullable(version)).toBeUndefined();
					}
				});

				it(
					'should be able to update after upgrade and has version set',
					{ timeout: 60000 },
					async () => {
						const full_path = `/${collection}/ugprade.html`;

						await upload({ actor, full_path });

						await upgradeVersion('0.0.17');

						newActor = pic.createActor<SatelliteActor_0_0_17>(
							idlFactorSatellite_0_0_17,
							canisterId
						);
						newActor.setIdentity(controller);

						await upload({ actor: newActor, full_path });

						const { get_asset } = newActor;

						const asset = fromNullable(await get_asset(collection, full_path));

						expect(asset).not.toBeUndefined();

						assertNonNullish(asset);

						expect(fromNullable(asset.version)).toEqual(1n);
					}
				);
			});
		});
	});

	describe('v0.0.20 -> v0.0.21', () => {
		let actor: Actor<SatelliteActor_0_0_16>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite('0.0.20');

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor_0_0_16>({
				idlFactory: idlFactorSatellite_0_0_16,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		it('should not populate an index HTML file', async () => {
			await upgradeVersion('0.0.21');

			const { http_request } = actor;

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/'
			});

			expect(status_code).toBe(404);
		});
	});

	describe('v0.0.21 -> v0.0.22', () => {
		let actor: Actor<SatelliteActor_0_0_21>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite('0.0.21');

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor_0_0_21>({
				idlFactory: idlFactorSatellite_0_0_21,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		it('should still migrate rules with none max_changes_per_users', async () => {
			const { set_rule } = actor;

			const collection = 'test_migration';

			await set_rule({ Db: null }, collection, {
				memory: toNullable({ Heap: null }),
				version: toNullable(),
				max_size: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Public: null },
				max_capacity: toNullable(),
				rate_config: toNullable()
			});

			await upgradeVersion('0.0.22');

			const newActor = pic.createActor<SatelliteActor>(idlFactorSatellite, canisterId);
			newActor.setIdentity(controller);

			const { get_rule } = newActor;

			const result = await get_rule({ Db: null }, collection);

			const rule = fromNullable(result);

			assertNonNullish(rule);

			const {
				updated_at,
				created_at,
				memory,
				mutable_permissions,
				read,
				write,
				version,
				max_changes_per_user
			} = rule;

			expect(memory).toEqual(toNullable({ Heap: null }));
			expect(read).toEqual({ Managed: null });
			expect(write).toEqual({ Public: null });
			expect(mutable_permissions).toEqual([true]);
			expect(created_at).toBeGreaterThan(0n);
			expect(updated_at).toBeGreaterThan(0n);
			expect(fromNullable(version)).toEqual(1n);

			expect(fromNullable(max_changes_per_user)).toBeUndefined();
		});

		it('should create a rule for collection #user-usage', async () => {
			const collection = '#user-usage';

			const { get_rule: getRuleBefore } = actor;

			const beforeUpgrade = await getRuleBefore({ Db: null }, collection);

			expect(fromNullable(beforeUpgrade)).toBeUndefined();

			await upgradeVersion('0.0.22');

			const newActor = pic.createActor<SatelliteActor>(idlFactorSatellite, canisterId);
			newActor.setIdentity(controller);

			const { get_rule: getRuleAfter } = newActor;

			const afterUpgrade = await getRuleAfter({ Db: null }, collection);

			const rule = fromNullable(afterUpgrade);

			assertNonNullish(rule);

			const {
				updated_at,
				created_at,
				memory,
				mutable_permissions,
				read,
				write,
				version,
				max_changes_per_user,
				max_capacity,
				max_size,
				rate_config
			} = rule;

			expect(memory).toEqual(toNullable({ Stable: null }));
			expect(read).toEqual({ Controllers: null });
			expect(write).toEqual({ Controllers: null });
			expect(mutable_permissions).toEqual([false]);
			expect(created_at).toBeGreaterThan(0n);
			expect(updated_at).toBeGreaterThan(0n);
			expect(fromNullable(version)).toBeUndefined();
			expect(fromNullable(max_changes_per_user)).toBeUndefined();
			expect(fromNullable(max_capacity)).toBeUndefined();
			expect(fromNullable(max_size)).toBeUndefined();
			expect(fromNullable(rate_config)).toBeUndefined();
		});
	});

	describe('v0.0.22 -> v0.1.0', () => {
		// For simplicity reason we also use actor v0.0.21 as the API was similar for version.
		let actor: Actor<SatelliteActor_0_0_21>;

		const PREVIOUS_VERSION = '0.0.22';

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite(PREVIOUS_VERSION);

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor_0_0_21>({
				idlFactory: idlFactorSatellite_0_0_21,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		it('should deprecated build version', async () => {
			await expect(actor.build_version()).resolves.toEqual(PREVIOUS_VERSION);

			await upgrade();

			await expect(async () => await actor.build_version()).rejects.toThrow(
				new RegExp("Canister has no query method 'build_version'.", 'i')
			);
		});

		it('should deprecate version', async () => {
			await expect(actor.version()).resolves.toEqual(PREVIOUS_VERSION);

			await upgrade();

			await expect(async () => await actor.version()).rejects.toThrow(
				new RegExp("Canister has no query method 'version'.", 'i')
			);
		});

		it('should create collection #_juno/releases', async () => {
			await upgrade();

			const { get_rule } = actor;

			const result = await get_rule({ Storage: null }, '#_juno/releases');

			const rule = fromNullable(result);

			assertNonNullish(rule);

			const { updated_at, created_at, memory, mutable_permissions, read, write, version } = rule;

			expect(memory).toEqual(toNullable({ Heap: null }));
			expect(read).toEqual({ Controllers: null });
			expect(write).toEqual({ Controllers: null });
			expect(mutable_permissions).toEqual([false]);
			expect(created_at).toBeGreaterThan(0n);
			expect(updated_at).toBeGreaterThan(0n);
			expect(fromNullable(version)).toBeUndefined();
		});

		it('should preserve controllers even if scope enum is extended', async () => {
			const user1 = Ed25519KeyIdentity.generate();
			const user2 = Ed25519KeyIdentity.generate();
			const admin1 = Ed25519KeyIdentity.generate();

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					scope: { Write: null },
					metadata: [['hello', 'world']],
					expires_at: []
				},
				controllers: [user1.getPrincipal(), user2.getPrincipal()]
			});

			await set_controllers({
				controller: {
					scope: { Admin: null },
					metadata: [['super', 'top']],
					expires_at: []
				},
				controllers: [admin1.getPrincipal()]
			});

			const assertControllers = async (actor: SatelliteActor | SatelliteActor_0_0_21) => {
				const { list_controllers } = actor;

				const controllers = await list_controllers();

				expect(
					controllers.find(([p, _]) => p.toText() === controller.getPrincipal().toText())
				).not.toBeUndefined();

				const assertWriteController = (controller: Principal) => {
					const maybeUser = controllers.find(([p, _]) => p.toText() === controller.toText());
					assertNonNullish(maybeUser);

					expect(maybeUser[1].scope).toEqual({ Write: null });
					expect(maybeUser[1].metadata).toEqual([['hello', 'world']]);
				};

				assertWriteController(user1.getPrincipal());
				assertWriteController(user2.getPrincipal());

				const maybeAdmin = controllers.find(
					([p, _]) => p.toText() === admin1.getPrincipal().toText()
				);
				assertNonNullish(maybeAdmin);

				expect(maybeAdmin[1].scope).toEqual({ Admin: null });
				expect(maybeAdmin[1].metadata).toEqual([['super', 'top']]);
			};

			await assertControllers(actor);

			await upgrade();

			const newActor = pic.createActor<SatelliteActor>(idlFactorSatellite, canisterId);
			newActor.setIdentity(controller);

			await assertControllers(newActor);
		});
	});
});
