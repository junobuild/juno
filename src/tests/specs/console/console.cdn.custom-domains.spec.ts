import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from '../../constants/console-tests.constants';
import { uploadFile } from '../../utils/console-tests.utils';
import {
	adminCustomDomainsTests,
	anonymousCustomDomainsTests
} from '../../utils/custom-domains-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Cdn > Custom Domains', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactorConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		anonymousCustomDomainsTests({ actor: () => actor, errorMsg: CONTROLLER_ERROR_MSG });
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		adminCustomDomainsTests({ actor: () => actor });

		it('should not delete asset ic-domains when deleting all assets', async () => {
			const { http_request, init_proposal, submit_proposal, commit_proposal } = actor;

			const [proposalId, _] = await init_proposal({
				AssetsUpgrade: {
					clear_existing_assets: toNullable(true)
				}
			});

			await uploadFile({ proposalId, actor });

			const [__, proposal] = await submit_proposal(proposalId);

			await commit_proposal({
				sha256: fromNullable(proposal.sha256)!,
				proposal_id: proposalId
			});

			const { status_code } = await http_request({
				body: [],
				certificate_version: toNullable(),
				headers: [],
				method: 'GET',
				url: '/.well-known/ic-domains'
			});

			expect(status_code).toEqual(200);
		});

		it('should throw error if try to upload ic-domains', async () => {
			const { init_asset_upload, init_proposal } = actor;

			const [proposalId, _] = await init_proposal({
				AssetsUpgrade: {
					clear_existing_assets: toNullable()
				}
			});

			await expect(
				init_asset_upload(
					{
						collection: '#dapp',
						description: toNullable(),
						encoding_type: [],
						full_path: '/.well-known/ic-domains',
						name: 'ic-domains',
						token: toNullable()
					},
					proposalId
				)
			).rejects.toThrow('/.well-known/ic-domains is a reserved asset.');
		});
	});
});
