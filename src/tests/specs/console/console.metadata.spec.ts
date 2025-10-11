import { idlFactoryConsole, type ConsoleActor } from '$declarations';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { JUNO_STORAGE_ERROR_RESERVED_ASSET } from '@junobuild/errors';
import { inject } from 'vitest';
import { uploadFile } from '../../utils/cdn-tests.utils';
import { deploySegments } from '../../utils/console-tests.utils';
import { CONSOLE_WASM_PATH, WASM_VERSIONS } from '../../utils/setup-tests.utils';

describe('Console > Metadata', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		await deploySegments(actor);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should expose /releases/metadata.json', async () => {
			const { http_request } = actor;

			const { body } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/releases/metadata.json'
			});

			const decoder = new TextDecoder();
			const responseBody = decoder.decode(body as Uint8Array<ArrayBufferLike>);

			expect(responseBody).toEqual(
				JSON.stringify({
					mission_controls: [WASM_VERSIONS.mission_control],
					satellites: [WASM_VERSIONS.satellite],
					orbiters: [WASM_VERSIONS.orbiter]
				})
			);
		});
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should not delete asset metadata.json when deleting all assets', async () => {
			const { http_request, init_proposal, submit_proposal, commit_proposal } = actor;

			const [proposalId, _] = await init_proposal({
				AssetsUpgrade: {
					clear_existing_assets: toNullable(true)
				}
			});

			await uploadFile({ proposalId, actor });

			const [__, proposal] = await submit_proposal(proposalId);

			const sha = fromNullable(proposal.sha256);

			assertNonNullish(sha);

			await commit_proposal({
				sha256: sha,
				proposal_id: proposalId
			});

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/releases/metadata.json'
			});

			expect(status_code).toEqual(200);
		});

		it('should throw error if try to upload metadata.json', async () => {
			const { init_proposal_asset_upload, init_proposal } = actor;

			const [proposalId, _] = await init_proposal({
				AssetsUpgrade: {
					clear_existing_assets: toNullable()
				}
			});

			await expect(
				init_proposal_asset_upload(
					{
						collection: '#releases',
						description: toNullable(),
						encoding_type: [],
						full_path: '/releases/metadata.json',
						name: 'metadata.json',
						token: toNullable()
					},
					proposalId
				)
			).rejects.toThrow(`${JUNO_STORAGE_ERROR_RESERVED_ASSET} (/releases/metadata.json)`);
		});
	});
});
