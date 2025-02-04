import type { ListParams, _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, nonNullish, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { createDoc as createDocUtils } from './utils/satellite-doc-tests.utils';
import { uploadAsset } from './utils/satellite-storage-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from './utils/setup-tests.utils';

describe('Satellite max changes', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const config = async ({
		collection,
		collectionType,
		maxChanges
	}: {
		maxChanges: number | undefined;
		collection: string;
		collectionType: { Db: null } | { Storage: null };
	}) => {
		actor.setIdentity(controller);

		const { set_rule, get_rule } = actor;

		const result = await get_rule(collectionType, collection);
		const rule = fromNullable(result);

		await set_rule(collectionType, collection, {
			memory: nonNullish(rule) ? rule.memory : toNullable(),
			max_size: toNullable(),
			max_capacity: toNullable(),
			read: { Public: null },
			mutable_permissions: toNullable(true),
			write: { Public: null },
			version: nonNullish(rule) ? rule.version : toNullable(),
			rate_config: toNullable(),
			max_changes_per_user: toNullable(maxChanges)
		});
	};

	const NO_FILTER_PARAMS: ListParams = {
		matcher: toNullable(),
		order: toNullable(),
		owner: toNullable(),
		paginate: toNullable()
	};

	describe('Datastore', () => {
		const collectionType = { Db: null };

		const user = Ed25519KeyIdentity.generate();

		const createDoc = (collection: string): Promise<string> =>
			createDocUtils({
				actor,
				collection
			});

		const testShouldSucceed = async ({
			collection,
			docUser,
			maxChanges
		}: {
			collection: string;
			docUser: Identity;
			maxChanges: number | undefined;
		}) => {
			await config({
				collection,
				collectionType,
				maxChanges
			});

			actor.setIdentity(docUser);

			const countSetDocs = 10n;

			await Promise.all(
				Array.from({ length: Number(countSetDocs) }).map((_) => createDoc(collection))
			);

			const { count_docs } = actor;

			const count = await count_docs(collection, NO_FILTER_PARAMS);

			expect(count).toEqual(countSetDocs);
		};

		it('should not limit changes for user if no configuration is set', async () => {
			await testShouldSucceed({
				collection: 'test_user_changes',
				docUser: user,
				maxChanges: undefined
			});
		});

		it('should not limit changes for controllers', async () => {
			await testShouldSucceed({
				collection: 'test_controller_no_changes',
				docUser: controller,
				maxChanges: undefined
			});

			await testShouldSucceed({
				collection: 'test_controller_no_changes_even_if_configured',
				docUser: controller,
				maxChanges: 5
			});
		});

		it('should limit changes for user', async () => {
			const collection = 'test_db_max_changes';

			await config({
				collection,
				collectionType,
				maxChanges: 5
			});

			actor.setIdentity(user);

			const countSetDocs = 10n;

			const promises = Promise.all(
				Array.from({ length: Number(countSetDocs) }).map((_) => createDoc(collection))
			);

			await expect(promises).rejects.toThrow('Change limit reached.');
		});
	});

	describe('Storage', () => {
		const collectionType = { Storage: null };

		const user = Ed25519KeyIdentity.generate();

		const upload = async ({ collection, index }: { collection: string; index: number }) => {
			const name = `hello-${index}.html`;
			const full_path = `/${collection}/${name}`;

			await uploadAsset({
				full_path,
				name,
				collection: collection,
				actor
			});
		};

		const testShouldSucceed = async ({
			collection,
			assetUser,
			maxChanges
		}: {
			collection: string;
			assetUser: Identity;
			maxChanges: number | undefined;
		}) => {
			await config({
				collection,
				collectionType,
				maxChanges
			});

			actor.setIdentity(assetUser);

			const countUploadAssets = 10n;

			await Promise.all(
				Array.from({ length: Number(countUploadAssets) }).map((_, index) =>
					upload({ index, collection })
				)
			);

			const { count_assets } = actor;

			const count = await count_assets(collection, NO_FILTER_PARAMS);

			expect(count).toEqual(countUploadAssets);
		};

		it('should not limit changes for user if no configuration is set', async () => {
			await testShouldSucceed({
				collection: 'test_user_changes',
				assetUser: user,
				maxChanges: undefined
			});
		});

		it('should not limit changes for controllers', async () => {
			await testShouldSucceed({
				collection: 'test_controller_no_changes',
				assetUser: controller,
				maxChanges: undefined
			});

			await testShouldSucceed({
				collection: 'test_controller_no_changes_even_if_configured',
				assetUser: controller,
				maxChanges: 5
			});
		});

		it('should limit changes for user', async () => {
			const collection = 'test_db_max_changes';

			await config({
				collection,
				collectionType,
				maxChanges: 5
			});

			actor.setIdentity(user);

			const countSetDocs = 10n;

			const promises = Promise.all(
				Array.from({ length: Number(countSetDocs) }).map((_, index) =>
					upload({ index, collection })
				)
			);

			await expect(promises).rejects.toThrow('Change limit reached.');
		});
	});
});
