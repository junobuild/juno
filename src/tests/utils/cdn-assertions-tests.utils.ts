import type {
	CommitProposal,
	_SERVICE as ConsoleActor,
	InitAssetKey,
	UploadChunk
} from '$declarations/console/console.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import type { StorageConfig } from '$declarations/satellite/satellite.did';
import { toNullable } from '@dfinity/utils';
import type { Actor } from '@hadronous/pic';
import { expect } from 'vitest';

/* eslint-disable vitest/require-top-level-describe */

export const testNotAllowedCdnMethods = ({
	actor,
	errorMsg
}: {
	actor: () => Actor<MissionControlActor | ConsoleActor>;
	errorMsg: string;
}) => {
	it('should throw errors on init asset upload', async () => {
		const { init_asset_upload } = actor();

		const key: InitAssetKey = {
			token: toNullable(),
			collection: '#dapp',
			name: 'hello',
			description: toNullable(),
			encoding_type: toNullable(),
			full_path: '/hello.html'
		};

		await expect(init_asset_upload(key, 123n)).rejects.toThrow(errorMsg);
	});

	it('should throw errors on propose assets upgrade', async () => {
		const { upload_asset_chunk } = actor();

		const chunk: UploadChunk = {
			content: [1, 2, 3],
			batch_id: 123n,
			order_id: []
		};

		await expect(upload_asset_chunk(chunk)).rejects.toThrow(errorMsg);
	});

	it('should throw errors on commit asset upload', async () => {
		const { commit_asset_upload } = actor();

		const batch = {
			batch_id: 123n,
			headers: [],
			chunk_ids: [123n]
		};

		await expect(commit_asset_upload(batch)).rejects.toThrow(errorMsg);
	});

	it('should throw errors on list assets', async () => {
		const { list_assets } = actor();

		await expect(
			list_assets('#dapp', { matcher: [], order: [], owner: [], paginate: [] })
		).rejects.toThrow(errorMsg);
	});

	it('should throw errors on setting config', async () => {
		const { set_storage_config } = actor();

		await expect(
			set_storage_config({
				headers: [],
				iframe: toNullable(),
				redirects: toNullable(),
				rewrites: [],
				raw_access: toNullable(),
				max_memory_size: toNullable()
			})
		).rejects.toThrow(errorMsg);
	});

	it('should throw errors on getting storage config', async () => {
		const { get_storage_config } = actor();

		await expect(get_storage_config()).rejects.toThrow(errorMsg);
	});

	it('should throw errors on delete proposal assets', async () => {
		const { delete_proposal_assets } = actor();

		await expect(delete_proposal_assets({ proposal_ids: [1n] })).rejects.toThrow(errorMsg);
	});

	it('should throw errors on init proposal', async () => {
		const { init_proposal } = actor();

		await expect(init_proposal({ AssetsUpgrade: { clear_existing_assets: [] } })).rejects.toThrow(
			errorMsg
		);
	});

	it('should throw errors on submit proposal', async () => {
		const { submit_proposal } = actor();

		await expect(submit_proposal(123n)).rejects.toThrow(errorMsg);
	});

	it('should throw errors on commit proposal', async () => {
		const { commit_proposal } = actor();

		const commit: CommitProposal = {
			sha256: [1, 2, 3],
			proposal_id: 123n
		};

		await expect(commit_proposal(commit)).rejects.toThrow(errorMsg);
	});
};

export const testControlledCdnMethods = ({
	actor
}: {
	actor: () => Actor<MissionControlActor | ConsoleActor>;
}) => {
	it('should set and get config', async () => {
		const { set_storage_config, get_storage_config } = actor();

		const config: StorageConfig = {
			headers: [['*', [['Cache-Control', 'no-cache']]]],
			iframe: toNullable({ Deny: null }),
			redirects: [],
			rewrites: [],
			raw_access: toNullable(),
			max_memory_size: toNullable()
		};

		await set_storage_config(config);

		const savedConfig = await get_storage_config();

		expect(savedConfig).toEqual(config);
	});
};
/* eslint-enable */
