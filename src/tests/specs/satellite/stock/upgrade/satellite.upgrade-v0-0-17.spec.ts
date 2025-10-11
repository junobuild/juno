import {
	idlFactorySatellite0016,
	idlFactorySatellite0017,
	type SatelliteActor0016,
	type SatelliteActor0017,
	type SatelliteDid,
	type SatelliteDid0016,
	type SatelliteDid0017
} from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import {
	arrayBufferToUint8Array,
	assertNonNullish,
	fromNullable,
	toNullable
} from '@dfinity/utils';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import { mockData } from '../../../../mocks/doc.mocks';
import { mockBlob } from '../../../../mocks/storage.mocks';
import {
	initUsers,
	testUsers,
	upgradeSatellite,
	upgradeSatelliteVersion
} from '../../../../utils/satellite-upgrade-tests.utils';
import { controllersInitArgs, downloadSatellite } from '../../../../utils/setup-tests.utils';

describe('Satellite > Upgrade > v0.0.17', () => {
	let pic: PocketIc;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	describe('v0.0.11 -> v0.0.17', () => {
		let actor: Actor<SatelliteActor0016>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite('0.0.11');

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor0016>({
				idlFactory: idlFactorySatellite0016,
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

			await upgradeSatelliteVersion({ version: '0.0.12', controller, pic, canisterId });

			await testUsers({ users, actor });

			await upgradeSatelliteVersion({ version: '0.0.13', controller, pic, canisterId });

			await testUsers({ users, actor });

			await upgradeSatelliteVersion({ version: '0.0.14', controller, pic, canisterId });

			await testUsers({ users, actor });

			await upgradeSatelliteVersion({ version: '0.0.15', controller, pic, canisterId });

			await testUsers({ users, actor });

			await upgradeSatelliteVersion({ version: '0.0.16', controller, pic, canisterId });

			await testUsers({ users, actor });

			await upgradeSatelliteVersion({ version: '0.0.17', controller, pic, canisterId });

			await testUsers({ users, actor });

			await upgradeSatellite({ canisterId, pic, controller });

			await testUsers({ users, actor });
		});
	});

	describe('v0.0.16 -> v0.0.17', () => {
		let actor: Actor<SatelliteActor0016>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite('0.0.16');

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor0016>({
				idlFactory: idlFactorySatellite0016,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		const setRule: SatelliteDid0016.SetRule = {
			memory: toNullable({ Stable: null }),
			max_size: toNullable(),
			max_capacity: toNullable(),
			read: { Managed: null },
			mutable_permissions: toNullable(true),
			write: { Managed: null },
			updated_at: toNullable()
		};

		describe('Rules', () => {
			let newActor: Actor<SatelliteActor0017>;

			beforeEach(async () => {
				const { set_rule: set_rule_deprecated } = actor as SatelliteActor0016;

				await set_rule_deprecated({ Db: null }, 'test', setRule);

				await upgradeSatelliteVersion({ version: '0.0.17', pic, canisterId, controller });

				newActor = pic.createActor<SatelliteActor0017>(idlFactorySatellite0017, canisterId);
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

				const setUpdateRule: SatelliteDid0017.SetRule = {
					...setRule,
					version: toNullable()
				};

				await expect(set_rule({ Db: null }, 'test', setUpdateRule)).resolves.not.toThrow();
			});

			it('should be able to update rule after upgrade only once without version provided', async () => {
				const { set_rule: set_rule_deprecated } = actor as SatelliteActor0016;

				// We do not provide the version so it counts as a first set
				await set_rule_deprecated({ Db: null }, 'test', setRule);

				// We do not provide the version again so it should failed
				await expect(set_rule_deprecated({ Db: null }, 'test', setRule)).rejects.toThrow(
					'error_no_version_provided'
				);

				const { list_rules, set_rule } = newActor;

				const [[_, rule]] = await list_rules({ Db: null });

				expect(rule.version).toEqual(toNullable(1n));

				const setNewRule: SatelliteDid0017.SetRule = {
					...setRule,
					version: rule.version
				};

				// We do not provide the version so it counts as a first set
				await expect(set_rule({ Db: null }, 'test', setNewRule)).resolves.not.toThrow();
			});
		});

		describe('Documents', () => {
			const setDoc: SatelliteDid0016.SetDoc = {
				description: toNullable(),
				data: mockData,
				updated_at: toNullable()
			};

			const key = nanoid();
			const collection = 'test';

			let newActor: Actor<SatelliteActor0017>;

			beforeEach(async () => {
				const { set_rule: set_rule_deprecated } = actor as SatelliteActor0016;

				await set_rule_deprecated({ Db: null }, collection, setRule);

				const { set_doc: set_doc_deprecated } = actor as SatelliteActor0016;

				await set_doc_deprecated(collection, key, setDoc);

				await upgradeSatelliteVersion({ version: '0.0.17', controller, pic, canisterId });

				newActor = pic.createActor<SatelliteActor0017>(idlFactorySatellite0017, canisterId);
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

				const setUpdateDoc: SatelliteDid.SetDoc = {
					...setDoc,
					version: toNullable()
				};

				await expect(set_doc(collection, key, setUpdateDoc)).resolves.not.toThrow();
			});

			it('should be able to update doc after upgrade only once without version provided', async () => {
				const { set_doc: set_doc_deprecated } = actor as SatelliteActor0016;

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

				const setNewDoc: SatelliteDid.SetDoc = {
					...setDoc,
					version: doc.version
				};

				// We do not provide the version so it counts as a first set
				await expect(set_doc(collection, key, setNewDoc)).resolves.not.toThrow();
			});
		});

		describe('Storage', () => {
			let newActor: Actor<SatelliteActor0017>;

			describe('Custom domain', () => {
				it('should add version set to none to custom domain', async () => {
					const { set_custom_domain } = actor;

					await set_custom_domain('hello.com', ['123456']);
					await set_custom_domain('test2.com', []);

					await upgradeSatelliteVersion({ version: '0.0.17', controller, pic, canisterId });

					newActor = pic.createActor<SatelliteActor0017>(idlFactorySatellite0017, canisterId);
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

						await upgradeSatelliteVersion({ version: '0.0.17', controller, pic, canisterId });

						newActor = pic.createActor<SatelliteActor0017>(idlFactorySatellite0017, canisterId);
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
					actor: Actor<SatelliteActor0017 | SatelliteActor0016>;
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

					await upgradeSatelliteVersion({ version: '0.0.17', controller, pic, canisterId });

					newActor = pic.createActor<SatelliteActor0017>(idlFactorySatellite0017, canisterId);
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

						await upgradeSatelliteVersion({ version: '0.0.17', controller, pic, canisterId });

						newActor = pic.createActor<SatelliteActor0017>(idlFactorySatellite0017, canisterId);
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
});
