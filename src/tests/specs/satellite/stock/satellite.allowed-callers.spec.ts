import { type SatelliteActor, idlFactorySatellite } from '$lib/api/actors/actor.factory';
import type { SatelliteDid } from '$lib/types/declarations';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { fromNullable, isNullish, toNullable } from '@dfinity/utils';
import { JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED } from '@junobuild/errors';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import { mockSetRule } from '../../../mocks/collection.mocks';
import { mockListParams } from '../../../mocks/list.mocks';
import { uploadAsset } from '../../../utils/satellite-storage-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Allowed Callers', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const createUser = async (user: Identity) => {
		actor.setIdentity(user);

		const { set_doc } = actor;

		return await set_doc('#user', user.getPrincipal().toText(), {
			data: await toArray({
				provider: 'internet_identity'
			}),
			description: toNullable(),
			version: toNullable()
		});
	};

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorySatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	let configVersion: bigint | undefined = undefined;
	const nextConfigVersion = (): [] | [bigint] => {
		const result = toNullable(configVersion);
		configVersion = isNullish(configVersion) ? 1n : configVersion + 1n;
		return result;
	};

	const setSomeAllowedCaller = async () => {
		const someCaller = Ed25519KeyIdentity.generate();
		await setAllowedCallers({ allowedCallers: [someCaller.getPrincipal()] });
	};

	const setAllowedCallers = async ({ allowedCallers }: { allowedCallers: Principal[] }) => {
		actor.setIdentity(controller);

		const { set_auth_config } = actor;

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [],
			rules: [
				{
					allowed_callers: allowedCallers
				}
			],
			version: nextConfigVersion()
		};

		await set_auth_config(config);
	};

	const setEmptyAllowedCallers = async () => {
		actor.setIdentity(controller);

		const { set_auth_config } = actor;

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [],
			rules: [
				{
					allowed_callers: []
				}
			],
			version: nextConfigVersion()
		};

		await set_auth_config(config);
	};

	const resetAuthConfig = async () => {
		actor.setIdentity(controller);

		const { set_auth_config } = actor;

		const config: SatelliteDid.SetAuthenticationConfig = {
			internet_identity: [],
			rules: [],
			version: nextConfigVersion()
		};

		await set_auth_config(config);
	};

	describe('Without auth config', () => {
		const collection = 'test_allowed_callers_without_config';

		describe('Datastore', () => {
			let user: Identity;

			beforeAll(async () => {
				actor.setIdentity(controller);

				const { set_rule } = actor;

				await set_rule({ Db: null }, collection, mockSetRule);
			});

			beforeEach(() => {
				user = Ed25519KeyIdentity.generate();
			});

			describe('get document', () => {
				let docKey: string;

				beforeEach(async () => {
					await createUser(user);

					const { set_doc } = actor;

					docKey = nanoid();

					await set_doc(collection, docKey, {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					});
				});

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);
					const { get_doc } = actor;

					const result = await get_doc(collection, docKey);
					const doc = fromNullable(result);

					expect(doc).not.toBeUndefined();
				};

				it('should get document if no config', async () => {
					await assertAllowed();
				});
			});

			describe('get many documents', () => {
				let docKey: string;

				beforeEach(async () => {
					await createUser(user);

					const { set_doc } = actor;

					docKey = nanoid();

					await set_doc(collection, docKey, {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					});
				});

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);

					const { get_many_docs } = actor;

					const result = await get_many_docs([[collection, docKey]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).not.toBeUndefined();
				};

				it('should get documents if no config', async () => {
					await assertAllowed();
				});
			});

			describe('set document', () => {
				const createDoc = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<SatelliteDid.Doc> => {
					actor.setIdentity(actorIdentity ?? user);

					const { set_doc } = actor;

					return await set_doc(collection, nanoid(), {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					});
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					const doc = await createDoc(params);

					expect(doc).not.toBeUndefined();
				};

				it('should set document if no config', async () => {
					await assertAllowed();
				});
			});

			describe('set many documents', () => {
				const createDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { set_many_docs } = actor;

					const data: SatelliteDid.SetDoc = {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					};

					await set_many_docs([
						[collection, nanoid(), data],
						[collection, nanoid(), data]
					]);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(createDocs(params)).resolves.not.toThrow();
				};

				it('should set many documents if no config', async () => {
					await assertAllowed();
				});
			});

			describe('delete a document', () => {
				const deleteDoc = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_doc } = actor;

					await del_doc(collection, nanoid(), {
						version: toNullable()
					});
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async () => {
					await expect(deleteDoc()).resolves.not.toThrow();
				};

				it('should delete document if no config', async () => {
					await assertAllowed();
				});
			});

			describe('delete many documents', () => {
				const deleteDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_many_docs } = actor;

					const data: SatelliteDid.DelDoc = {
						version: toNullable()
					};

					await del_many_docs([
						[collection, nanoid(), data],
						[collection, nanoid(), data]
					]);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteDocs(params)).resolves.not.toThrow();
				};

				it('should delete documents if no config', async () => {
					await assertAllowed();
				});
			});

			describe('delete filtered documents', () => {
				const deleteFilteredDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_filtered_docs } = actor;

					await del_filtered_docs(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteFilteredDocs(params)).resolves.not.toThrow();
				};

				it('should delete filtered document if no config', async () => {
					await assertAllowed();
				});
			});

			describe('list documents', () => {
				const listDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { list_docs } = actor;

					await list_docs(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(listDocs(params)).resolves.not.toThrow();
				};

				it('should list documents if no config', async () => {
					await assertAllowed();
				});
			});

			describe('count documents', () => {
				const countDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { count_docs } = actor;

					await count_docs(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(countDocs(params)).resolves.not.toThrow();
				};

				it('should count document if no config', async () => {
					await assertAllowed();
				});
			});
		});

		describe('Storage', () => {
			let user: Identity;
			let fullPath: string;
			const filename = 'hello.html';

			beforeAll(async () => {
				actor.setIdentity(controller);

				const { set_rule } = actor;

				await set_rule({ Storage: null }, collection, mockSetRule);
			});

			beforeEach(() => {
				user = Ed25519KeyIdentity.generate();
				fullPath = `/${collection}/${user.getPrincipal().toText()}/hello.html`;
			});

			describe('init asset upload', () => {
				const initAsset = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { init_asset_upload } = actor;

					await init_asset_upload({
						collection,
						description: toNullable(),
						encoding_type: [],
						full_path: fullPath,
						name: filename,
						token: toNullable()
					});
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(initAsset(params)).resolves.not.toThrow();
				};

				it('should init asset upload if no config', async () => {
					await assertAllowed();
				});
			});

			describe('get asset', () => {
				beforeEach(async () => {
					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection,
						actor
					});
				});

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);
					const { get_asset } = actor;

					const result = await get_asset(collection, fullPath);
					const doc = fromNullable(result);

					expect(doc).not.toBeUndefined();
				};

				it('should get asset if no config', async () => {
					await assertAllowed();
				});
			});

			describe('delete filtered assets', () => {
				const deleteFilteredAssets = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_filtered_assets } = actor;

					await del_filtered_assets(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteFilteredAssets(params)).resolves.not.toThrow();
				};

				it('should delete assets if no config', async () => {
					await assertAllowed();
				});
			});

			describe('list assets', () => {
				const listAssets = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { list_assets } = actor;

					await list_assets(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(listAssets(params)).resolves.not.toThrow();
				};

				it('should list assets if no config', async () => {
					await assertAllowed();
				});
			});

			describe('count assets', () => {
				const countAssets = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { count_assets } = actor;

					await count_assets(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(countAssets(params)).resolves.not.toThrow();
				};

				it('should count assets if no config', async () => {
					await assertAllowed();
				});
			});

			describe('get many assets', () => {
				beforeEach(async () => {
					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection,
						actor
					});
				});

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);
					const { get_many_assets } = actor;

					const result = await get_many_assets([[collection, fullPath]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).not.toBeUndefined();
				};

				it('should get assets if no config', async () => {
					await assertAllowed();
				});
			});

			describe('delete an asset', () => {
				const deleteAsset = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_asset } = actor;

					await del_asset(collection, fullPath);
				};

				beforeEach(async () => {
					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection,
						actor
					});
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteAsset(params)).resolves.not.toThrow();
				};

				it('should delete asset if no config', async () => {
					await assertAllowed();
				});
			});

			describe('delete many assets', () => {
				const deleteAssets = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_many_assets } = actor;

					await del_many_assets([[collection, fullPath]]);
				};

				beforeEach(async () => {
					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection,
						actor
					});
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteAssets(params)).resolves.not.toThrow();
				};

				it('should delete assets if no config', async () => {
					await assertAllowed();
				});
			});
		});
	});

	describe('With auth config', () => {
		const collection = 'test_allowed_callers';

		describe('Datastore', () => {
			let user: Identity;

			beforeAll(async () => {
				actor.setIdentity(controller);

				const { set_rule } = actor;

				await set_rule({ Db: null }, collection, mockSetRule);
			});

			beforeEach(() => {
				user = Ed25519KeyIdentity.generate();
			});

			describe('get document', () => {
				let docKey: string;

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);

					const { set_doc } = actor;

					docKey = nanoid();

					await set_doc(collection, docKey, {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					});
				});

				it('should not get document if not allowed', async () => {
					await setSomeAllowedCaller();

					actor.setIdentity(user);
					const { get_doc } = actor;

					const result = await get_doc(collection, docKey);
					const doc = fromNullable(result);

					expect(doc).toBeUndefined();
				});

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);
					const { get_doc } = actor;

					const result = await get_doc(collection, docKey);
					const doc = fromNullable(result);

					expect(doc).not.toBeUndefined();
				};

				it('should get document if no rules', async () => {
					await assertAllowed();
				});

				it('should get document if empty allowed callers', async () => {
					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should get document if controller', async () => {
					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('get many documents', () => {
				let docKey: string;

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);

					const { set_doc } = actor;

					docKey = nanoid();

					await set_doc(collection, docKey, {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					});
				});

				it('should not get documents if not allowed', async () => {
					await setSomeAllowedCaller();

					actor.setIdentity(user);
					const { get_many_docs } = actor;

					const result = await get_many_docs([[collection, docKey]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).toBeUndefined();
				});

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);

					const { get_many_docs } = actor;

					const result = await get_many_docs([[collection, docKey]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).not.toBeUndefined();
				};

				it('should get documents if no rules', async () => {
					await assertAllowed();
				});

				it('should get documents if empty allowed callers', async () => {
					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should get documents if controller', async () => {
					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('set document', () => {
				const createDoc = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<SatelliteDid.Doc> => {
					actor.setIdentity(actorIdentity ?? user);

					const { set_doc } = actor;

					return await set_doc(collection, nanoid(), {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					});
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not set document if not allowed', async () => {
					const doc = await createDoc();

					expect(doc).not.toBeUndefined();

					await setSomeAllowedCaller();

					await expect(createDoc()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					const doc = await createDoc(params);

					expect(doc).not.toBeUndefined();
				};

				it('should set document if no rules', async () => {
					await assertAllowed();
				});

				it('should set document if empty allowed callers', async () => {
					await createDoc();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should set document if controller', async () => {
					await createDoc({ actorIdentity: controller });

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('set many documents', () => {
				const createDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { set_many_docs } = actor;

					const data: SatelliteDid.SetDoc = {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					};

					await set_many_docs([
						[collection, nanoid(), data],
						[collection, nanoid(), data]
					]);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not set many documents if not allowed', async () => {
					await expect(createDocs()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(createDocs()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(createDocs(params)).resolves.not.toThrow();
				};

				it('should set many documents if no rules', async () => {
					await assertAllowed();
				});

				it('should set many documents if empty allowed callers', async () => {
					await expect(createDocs()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should set many documents if controller', async () => {
					await expect(createDocs({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('delete a document', () => {
				const deleteDoc = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_doc } = actor;

					await del_doc(collection, nanoid(), {
						version: toNullable()
					});
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not delete document if not allowed', async () => {
					await expect(deleteDoc()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(deleteDoc()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteDoc(params)).resolves.not.toThrow();
				};

				it('should delete document if no rules', async () => {
					await assertAllowed();
				});

				it('should delete document if empty allowed callers', async () => {
					await expect(deleteDoc()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should delete document if controller', async () => {
					await expect(deleteDoc({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('delete many documents', () => {
				const deleteDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_many_docs } = actor;

					const data: SatelliteDid.DelDoc = {
						version: toNullable()
					};

					await del_many_docs([
						[collection, nanoid(), data],
						[collection, nanoid(), data]
					]);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not delete documents if not allowed', async () => {
					await expect(deleteDocs()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(deleteDocs()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteDocs(params)).resolves.not.toThrow();
				};

				it('should delete documents if no rules', async () => {
					await assertAllowed();
				});

				it('should delete documents if empty allowed callers', async () => {
					await expect(deleteDocs()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should delete document if controller', async () => {
					await expect(deleteDocs({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('delete filtered documents', () => {
				const deleteFilteredDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_filtered_docs } = actor;

					await del_filtered_docs(collection, mockListParams);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not delete documents if not allowed', async () => {
					await expect(deleteFilteredDocs()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(deleteFilteredDocs()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteFilteredDocs(params)).resolves.not.toThrow();
				};

				it('should delete filtered document if no rules', async () => {
					await assertAllowed();
				});

				it('should delete filtered document if empty allowed callers', async () => {
					await expect(deleteFilteredDocs()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should delete filtered document if controller', async () => {
					await expect(deleteFilteredDocs({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('list documents', () => {
				const listDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { list_docs } = actor;

					await list_docs(collection, mockListParams);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not list documents if not allowed', async () => {
					await expect(listDocs()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(listDocs()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(listDocs(params)).resolves.not.toThrow();
				};

				it('should list documents if no rules', async () => {
					await assertAllowed();
				});

				it('should list documents if empty allowed callers', async () => {
					await expect(listDocs()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should list documents if controller', async () => {
					await expect(listDocs({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('count documents', () => {
				const countDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { count_docs } = actor;

					await count_docs(collection, mockListParams);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not count documents if not allowed', async () => {
					await expect(countDocs()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(countDocs()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(countDocs(params)).resolves.not.toThrow();
				};

				it('should count document if no rules', async () => {
					await assertAllowed();
				});

				it('should count document if empty allowed callers', async () => {
					await expect(countDocs()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should count document if controller', async () => {
					await expect(countDocs({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});
		});

		describe('Storage', () => {
			let user: Identity;
			let fullPath: string;
			const filename = 'hello.html';

			beforeAll(async () => {
				actor.setIdentity(controller);

				const { set_rule } = actor;

				await set_rule({ Storage: null }, collection, mockSetRule);
			});

			beforeEach(async () => {
				await resetAuthConfig();

				user = Ed25519KeyIdentity.generate();
				fullPath = `/${collection}/${user.getPrincipal().toText()}/hello.html`;
			});

			describe('init asset upload', () => {
				const initAsset = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { init_asset_upload } = actor;

					await init_asset_upload({
						collection,
						description: toNullable(),
						encoding_type: [],
						full_path: fullPath,
						name: filename,
						token: toNullable()
					});
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not init asset upload if not allowed', async () => {
					await expect(initAsset()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(initAsset()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(initAsset(params)).resolves.not.toThrow();
				};

				it('should init asset upload if no rules', async () => {
					await assertAllowed();
				});

				it('should init asset upload if empty allowed callers', async () => {
					await expect(initAsset()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should init asset upload if controller', async () => {
					await expect(initAsset({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('get asset', () => {
				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection,
						actor
					});
				});

				it('should not get asset if not allowed', async () => {
					await setSomeAllowedCaller();

					actor.setIdentity(user);
					const { get_asset } = actor;

					const result = await get_asset(collection, fullPath);
					const asset = fromNullable(result);

					expect(asset).toBeUndefined();
				});

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);
					const { get_asset } = actor;

					const result = await get_asset(collection, fullPath);
					const doc = fromNullable(result);

					expect(doc).not.toBeUndefined();
				};

				it('should get asset if no rules', async () => {
					await assertAllowed();
				});

				it('should get asset if empty allowed callers', async () => {
					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should get asset if controller', async () => {
					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('delete filtered assets', () => {
				const deleteFilteredAssets = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_filtered_assets } = actor;

					await del_filtered_assets(collection, mockListParams);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not delete assets if banned', async () => {
					await expect(deleteFilteredAssets()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(deleteFilteredAssets()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteFilteredAssets(params)).resolves.not.toThrow();
				};

				it('should delete assets if no rules', async () => {
					await assertAllowed();
				});

				it('should delete assets if empty allowed callers', async () => {
					await expect(deleteFilteredAssets()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should delete assets if controller', async () => {
					await expect(deleteFilteredAssets({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('list assets', () => {
				const listAssets = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { list_assets } = actor;

					await list_assets(collection, mockListParams);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not list assets if not allowed', async () => {
					await expect(listAssets()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(listAssets()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(listAssets(params)).resolves.not.toThrow();
				};

				it('should list assets if no rules', async () => {
					await assertAllowed();
				});

				it('should list assets if empty allowed callers', async () => {
					await expect(listAssets()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should list assets if controller', async () => {
					await expect(listAssets({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('count assets', () => {
				const countAssets = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { count_assets } = actor;

					await count_assets(collection, mockListParams);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not count assets if not allowed', async () => {
					await expect(countAssets()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(countAssets()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(countAssets(params)).resolves.not.toThrow();
				};

				it('should count assets if no rules', async () => {
					await assertAllowed();
				});

				it('should count assets if empty allowed callers', async () => {
					await expect(countAssets()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should count assets if controller', async () => {
					await expect(countAssets({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('get many assets', () => {
				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection,
						actor
					});
				});

				it('should not get assets if not allowed', async () => {
					await setSomeAllowedCaller();

					actor.setIdentity(user);
					const { get_many_assets } = actor;

					const result = await get_many_assets([[collection, fullPath]]);

					const asset = fromNullable(result[0][1]);

					expect(asset).toBeUndefined();
				});

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);
					const { get_many_assets } = actor;

					const result = await get_many_assets([[collection, fullPath]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).not.toBeUndefined();
				};

				it('should get assets if no rules', async () => {
					await assertAllowed();
				});

				it('should get assets if empty allowed callers', async () => {
					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should get assets if controller', async () => {
					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('delete an asset', () => {
				const deleteAsset = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_asset } = actor;

					await del_asset(collection, fullPath);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection,
						actor
					});
				});

				it('should not delete an asset if not allowed', async () => {
					await setSomeAllowedCaller();

					await expect(deleteAsset()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteAsset(params)).resolves.not.toThrow();
				};

				it('should delete asset if no rules', async () => {
					await assertAllowed();
				});

				it('should delete asset if empty allowed callers', async () => {
					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should delete asset if controller', async () => {
					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('delete many assets', () => {
				const deleteAssets = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { del_many_assets } = actor;

					await del_many_assets([[collection, fullPath]]);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection,
						actor
					});
				});

				it('should not delete assets if not allowed', async () => {
					await setSomeAllowedCaller();

					await expect(deleteAssets()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(deleteAssets(params)).resolves.not.toThrow();
				};

				it('should delete assets if no rules', async () => {
					await assertAllowed();
				});

				it('should delete assets if empty allowed callers', async () => {
					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should delete assets if controller', async () => {
					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});
		});
	});
});
