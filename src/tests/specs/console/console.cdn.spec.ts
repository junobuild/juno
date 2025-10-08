import { idlFactoryConsole, type ConsoleActor } from '$declarations';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from '../../constants/console-tests.constants';
import {
	testCdnConfig,
	testCdnCountProposals,
	testCdnGetProposal,
	testCdnListProposals,
	testCdnStorageSettings,
	testControlledCdnMethods,
	testGuardedAssetsCdnMethods,
	testNotAllowedCdnMethods,
	testReleasesProposal
} from '../../utils/cdn-assertions-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Cdn', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		canisterId = cId;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testNotAllowedCdnMethods({ actor: () => actor, errorMsgAdminController: CONTROLLER_ERROR_MSG });

		testGuardedAssetsCdnMethods({
			actor: () => actor,
			errorMsgAdminController: CONTROLLER_ERROR_MSG
		});
	});

	describe('Some identity', () => {
		beforeAll(() => {
			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		testNotAllowedCdnMethods({ actor: () => actor, errorMsgAdminController: CONTROLLER_ERROR_MSG });

		testGuardedAssetsCdnMethods({
			actor: () => actor,
			errorMsgAdminController: CONTROLLER_ERROR_MSG
		});
	});

	describe('Admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		testCdnConfig({
			actor: () => actor
		});

		testControlledCdnMethods({
			actor: () => actor,
			currentDate,
			canisterId: () => canisterId,
			caller: () => controller,
			pic: () => pic
		});

		testReleasesProposal({
			actor: () => actor
		});

		testCdnStorageSettings({
			actor: () => actor,
			pic: () => pic
		});
	});

	describe('anonymous (again)', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testCdnGetProposal({
			actor: () => actor,
			owner: () => controller
		});

		testCdnListProposals({
			actor: () => actor
		});

		testCdnCountProposals({
			actor: () => actor
		});
	});
});
