import { idlFactoryConsole, type ConsoleActor } from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from '../../../constants/console-tests.constants';
import {
	adminCustomDomainsTests,
	adminCustomDomainsWithProposalTests,
	anonymousCustomDomainsTests
} from '../../../utils/custom-domains-tests.utils';
import { CONSOLE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Console > Cdn > Custom Domains', () => {
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

		adminCustomDomainsWithProposalTests({ actor: () => actor });
	});
});
