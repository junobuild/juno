import type {
	DelDoc,
	Doc,
	_SERVICE as SatelliteActor,
	SetDoc
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { type Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import {
	JUNO_DATASTORE_ERROR_USER_INVALID_DATA,
	JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED
} from '@junobuild/errors';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { beforeAll, describe, expect, inject } from 'vitest';
import { mockSetRule } from './mocks/collection.mocks';
import { mockListParams } from './mocks/list.mocks';
import { uploadAsset } from './utils/satellite-storage-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from './utils/setup-tests.utils';

describe('Satellite > User Ban', () => {
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

	const banUser = async ({ user, version }: { user: Identity; version: [] | [bigint] }) => {
		actor.setIdentity(controller);

		const { set_doc } = actor;

		await set_doc('#user', user.getPrincipal().toText(), {
			data: await toArray({
				provider: 'internet_identity',
				banned: 'indefinite'
			}),
			description: toNullable(),
			version: version
		});
	};

	const unbanUser = async ({ user, version }: { user: Identity; version: [] | [bigint] }) => {
		actor.setIdentity(controller);

		const { set_doc } = actor;

		await set_doc('#user', user.getPrincipal().toText(), {
			data: await toArray({
				provider: 'internet_identity',
				banned: undefined
			}),
			description: toNullable(),
			version: version
		});
	};

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
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

	describe('User', () => {
		describe('error', () => {
			let user: Identity;

			beforeEach(() => {
				user = Ed25519KeyIdentity.generate();
				actor.setIdentity(user);
			});

			it('should not create a user with invalid banned data field', async () => {
				const { set_doc } = actor;

				const data = await toArray({
					provider: 'internet_identity',
					banned: 'yolo'
				});

				await expect(
					set_doc('#user', user.getPrincipal().toText(), {
						data,
						description: toNullable(),
						version: toNullable()
					})
				).rejects.toThrow(
					`${JUNO_DATASTORE_ERROR_USER_INVALID_DATA}: unknown variant \`yolo\`, expected \`indefinite\` at line 1 column 47.`
				);
			});
		});
	});

	describe('Admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should list users including never banned, banned and unbanned', async () => {
			const user1 = Ed25519KeyIdentity.generate();
			await createUser(user1);

			const user2 = Ed25519KeyIdentity.generate();
			await createUser(user2);

			const user3 = Ed25519KeyIdentity.generate();
			await createUser(user3);

			await banUser({ user: user1, version: [1n] });

			await banUser({ user: user2, version: [1n] });
			await unbanUser({ user: user2, version: [2n] });

			const { list_docs } = actor;

			const { items, items_length } = await list_docs('#user', mockListParams);

			expect(items_length).toEqual(3n);

			const item1 = items.find(([key, _]) => key === user1.getPrincipal().toText());
			const item2 = items.find(([key, _]) => key === user2.getPrincipal().toText());
			const item3 = items.find(([key, _]) => key === user3.getPrincipal().toText());

			expect(item1).not.toBeUndefined();
			expect(item2).not.toBeUndefined();
			expect(item3).not.toBeUndefined();

			expect(await fromArray(item1?.[1].data ?? [])).toEqual({
				provider: 'internet_identity',
				banned: 'indefinite'
			});
			expect(await fromArray(item2?.[1].data ?? [])).toEqual({ provider: 'internet_identity' });
			expect(await fromArray(item3?.[1].data ?? [])).toEqual({ provider: 'internet_identity' });
		});
	});

	describe('Ban', () => {
		const collection = 'test_banned';

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

				it('should not get document if banned', async () => {
					await banUser({ user, version: [1n] });

					actor.setIdentity(user);
					const { get_doc } = actor;

					const result = await get_doc(collection, docKey);
					const doc = fromNullable(result);

					expect(doc).toBeUndefined();
				});

				it('should get document if unbanned', async () => {
					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					actor.setIdentity(user);
					const { get_doc } = actor;

					const result = await get_doc(collection, docKey);
					const doc = fromNullable(result);

					expect(doc).not.toBeUndefined();
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

				it('should not get documents if banned', async () => {
					await banUser({ user, version: [1n] });

					actor.setIdentity(user);
					const { get_many_docs } = actor;

					const result = await get_many_docs([[collection, docKey]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).toBeUndefined();
				});

				it('should get documents if unbanned', async () => {
					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					actor.setIdentity(user);
					const { get_many_docs } = actor;

					const result = await get_many_docs([[collection, docKey]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).not.toBeUndefined();
				});
			});

			describe('set document', () => {
				const createDoc = async (): Promise<Doc> => {
					actor.setIdentity(user);

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

				it('should not set document if banned', async () => {
					const doc = await createDoc();

					expect(doc).not.toBeUndefined();

					await banUser({ user, version: [1n] });

					await expect(createDoc()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should set document if unbanned', async () => {
					await createDoc();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					const doc = await createDoc();

					expect(doc).not.toBeUndefined();
				});
			});

			describe('set many documents', () => {
				const createDocs = async (): Promise<void> => {
					actor.setIdentity(user);

					const { set_many_docs } = actor;

					const data: SetDoc = {
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

				it('should not set documents if banned', async () => {
					await expect(createDocs()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });

					await expect(createDocs()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should set documents if unbanned', async () => {
					await expect(createDocs()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(createDocs()).resolves.not.toThrowError();
				});
			});

			describe('delete a document', () => {
				const deleteDoc = async (): Promise<void> => {
					actor.setIdentity(user);

					const { del_doc } = actor;

					await del_doc(collection, nanoid(), {
						version: toNullable()
					});
				};

				beforeEach(async () => {
					await createUser(user);
				});

				it('should not delete document if banned', async () => {
					await expect(deleteDoc()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });

					await expect(deleteDoc()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should delete document if unbanned', async () => {
					await expect(deleteDoc()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(deleteDoc()).resolves.not.toThrowError();
				});
			});

			describe('delete many documents', () => {
				const deleteDocs = async (): Promise<void> => {
					actor.setIdentity(user);

					const { del_many_docs } = actor;

					const data: DelDoc = {
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

				it('should not delete documents if banned', async () => {
					await expect(deleteDocs()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });

					await expect(deleteDocs()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should delete documents if unbanned', async () => {
					await expect(deleteDocs()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(deleteDocs()).resolves.not.toThrowError();
				});
			});

			describe('delete filtered documents', () => {
				const deleteFilteredDocs = async (): Promise<void> => {
					actor.setIdentity(user);

					const { del_filtered_docs } = actor;

					await del_filtered_docs(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				it('should not delete documents if banned', async () => {
					await expect(deleteFilteredDocs()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });

					await expect(deleteFilteredDocs()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should get documents if unbanned', async () => {
					await expect(deleteFilteredDocs()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(deleteFilteredDocs()).resolves.not.toThrowError();
				});
			});

			describe('list documents', () => {
				const listDocs = async (): Promise<void> => {
					actor.setIdentity(user);

					const { list_docs } = actor;

					await list_docs(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				it('should not list documents if banned', async () => {
					await expect(listDocs()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });

					await expect(listDocs()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should list documents if unbanned', async () => {
					await expect(listDocs()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(listDocs()).resolves.not.toThrowError();
				});
			});

			describe('count documents', () => {
				const countDocs = async (): Promise<void> => {
					actor.setIdentity(user);

					const { count_docs } = actor;

					await count_docs(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				it('should not count documents if banned', async () => {
					await expect(countDocs()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });

					await expect(countDocs()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should count documents if unbanned', async () => {
					await expect(countDocs()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(countDocs()).resolves.not.toThrowError();
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
				const initAsset = async (): Promise<void> => {
					actor.setIdentity(user);

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

				it('should not init asset upload if banned', async () => {
					await expect(initAsset()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });

					await expect(initAsset()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should init asset upload if unbanned', async () => {
					await expect(initAsset()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(initAsset()).resolves.not.toThrowError();
				});
			});

			describe('get asset', () => {
				beforeEach(async () => {
					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection: collection,
						actor
					});
				});

				it('should not get asset if banned', async () => {
					await banUser({ user, version: [1n] });

					actor.setIdentity(user);
					const { get_asset } = actor;

					const result = await get_asset(collection, fullPath);
					const asset = fromNullable(result);

					expect(asset).toBeUndefined();
				});

				it('should get asset if unbanned', async () => {
					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					actor.setIdentity(user);
					const { get_asset } = actor;

					const result = await get_asset(collection, fullPath);
					const doc = fromNullable(result);

					expect(doc).not.toBeUndefined();
				});
			});

			describe('delete filtered assets', () => {
				const deleteFilteredAssets = async (): Promise<void> => {
					actor.setIdentity(user);

					const { del_filtered_assets } = actor;

					await del_filtered_assets(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				it('should not delete assets if banned', async () => {
					await expect(deleteFilteredAssets()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });

					await expect(deleteFilteredAssets()).rejects.toThrow(
						JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED
					);
				});

				it('should get assets if unbanned', async () => {
					await expect(deleteFilteredAssets()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(deleteFilteredAssets()).resolves.not.toThrowError();
				});
			});

			describe('list assets', () => {
				const listAssets = async (): Promise<void> => {
					actor.setIdentity(user);

					const { list_assets } = actor;

					await list_assets(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				it('should not list assets if banned', async () => {
					await expect(listAssets()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });

					await expect(listAssets()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should list assets if unbanned', async () => {
					await expect(listAssets()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(listAssets()).resolves.not.toThrowError();
				});
			});

			describe('count assets', () => {
				const countAssets = async (): Promise<void> => {
					actor.setIdentity(user);

					const { count_assets } = actor;

					await count_assets(collection, mockListParams);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				it('should not count assets if banned', async () => {
					await expect(countAssets()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });

					await expect(countAssets()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should count assets if unbanned', async () => {
					await expect(countAssets()).resolves.not.toThrowError();

					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(countAssets()).resolves.not.toThrowError();
				});
			});

			describe('get many assets', () => {
				beforeEach(async () => {
					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection: collection,
						actor
					});
				});

				it('should not get assets if banned', async () => {
					await banUser({ user, version: [1n] });

					actor.setIdentity(user);
					const { get_many_assets } = actor;

					const result = await get_many_assets([[collection, fullPath]]);

					const asset = fromNullable(result[0][1]);

					expect(asset).toBeUndefined();
				});

				it('should get assets if unbanned', async () => {
					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					actor.setIdentity(user);
					const { get_many_assets } = actor;

					const result = await get_many_assets([[collection, fullPath]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).not.toBeUndefined();
				});
			});

			describe('delete an asset', () => {
				const deleteAsset = async (): Promise<void> => {
					actor.setIdentity(user);

					const { del_asset } = actor;

					await del_asset(collection, fullPath);
				};

				beforeEach(async () => {
					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection: collection,
						actor
					});
				});

				it('should not delete an asset if banned', async () => {
					await banUser({ user, version: [1n] });

					await expect(deleteAsset()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should delete asset if unbanned', async () => {
					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(deleteAsset()).resolves.not.toThrowError();
				});
			});

			describe('delete many assets', () => {
				const deleteAssets = async (): Promise<void> => {
					actor.setIdentity(user);

					const { del_many_assets } = actor;

					await del_many_assets([[collection, fullPath]]);
				};

				beforeEach(async () => {
					await createUser(user);

					await uploadAsset({
						full_path: fullPath,
						name: filename,
						collection: collection,
						actor
					});
				});

				it('should not delete assets if banned', async () => {
					await banUser({ user, version: [1n] });

					await expect(deleteAssets()).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
				});

				it('should delete assets if unbanned', async () => {
					await banUser({ user, version: [1n] });
					await unbanUser({ user, version: [2n] });

					await expect(deleteAssets()).resolves.not.toThrowError();
				});
			});
		});
	});
});
