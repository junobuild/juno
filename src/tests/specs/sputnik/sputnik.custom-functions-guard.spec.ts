import type { SputnikDid } from '$declarations';
import type {
	AppOnlyAdminArgs,
	_SERVICE as TestSputnikActor
} from '$test-declarations/test_sputnik/test_sputnik.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import {
	JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER,
	JUNO_AUTH_ERROR_NOT_CONTROLLER,
	JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER
} from '@junobuild/errors';
import { mockPrincipal } from '../../../frontend/tests/mocks/identity.mock';
import { CONTROLLER_METADATA } from '../../constants/controller-tests.constants';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { createUser as createUserUtils } from '../../utils/satellite-doc-tests.utils';

describe('Sputnik > Custom Functions', () => {
	let pic: PocketIc;
	let actor: Actor<TestSputnikActor>;
	let controller: Identity;

	const createAccessKey = async (scope: SputnikDid.AccessKeyScope): Promise<{ user: Identity }> => {
		const { user } = await createUserUtils({ actor });

		actor.setIdentity(controller);

		const { set_controllers } = actor;

		await set_controllers({
			controller: {
				...CONTROLLER_METADATA,
				scope,
				metadata: [['hello', 'world']]
			},
			controllers: [user.getPrincipal()]
		});

		actor.setIdentity(user);

		return { user };
	};

	beforeAll(async () => {
		const { pic: p, actor: a, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		controller = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('callerIsAdmin', () => {
		afterAll(() => {
			actor.setIdentity(controller);
		});

		it('should call guarded query', async () => {
			const { app_only_admin } = actor;

			const args: AppOnlyAdminArgs = {
				value: mockPrincipal
			};

			await expect(app_only_admin(args)).resolves.not.toThrow();
		});

		it('should throw on guarded call', async () => {
			const { app_only_admin } = actor;

			const args: AppOnlyAdminArgs = {
				value: mockPrincipal
			};

			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			await expect(app_only_admin(args)).rejects.toThrow(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});
	});

	describe('callerHasWritePermission', () => {
		afterAll(() => {
			actor.setIdentity(controller);
		});

		it('should call guarded query with admin', async () => {
			const { app_admin_or_writer } = actor;

			await expect(app_admin_or_writer()).resolves.not.toThrow();
		});

		it('should call guarded query with write', async () => {
			const { app_admin_or_writer } = actor;

			await createAccessKey({ Write: null });

			await expect(app_admin_or_writer()).resolves.not.toThrow();
		});

		it('should throw on query with some caller', async () => {
			const { app_admin_or_writer } = actor;

			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			await expect(app_admin_or_writer()).rejects.toThrow(JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER);
		});
	});

	describe('callerIsAccessKey', () => {
		afterAll(() => {
			actor.setIdentity(controller);
		});

		it('should call guarded query with admin', async () => {
			const { app_admin_or_writer_or_submit } = actor;

			await expect(app_admin_or_writer_or_submit()).resolves.not.toThrow();
		});

		it('should call guarded query with write', async () => {
			const { app_admin_or_writer_or_submit } = actor;

			await createAccessKey({ Write: null });

			await expect(app_admin_or_writer_or_submit()).resolves.not.toThrow();
		});

		it('should call guarded query with submit', async () => {
			const { app_admin_or_writer_or_submit } = actor;

			await createAccessKey({ Submit: null });

			await expect(app_admin_or_writer_or_submit()).resolves.not.toThrow();
		});

		it('should throw on query with some caller', async () => {
			const { app_admin_or_writer_or_submit } = actor;

			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			await expect(app_admin_or_writer_or_submit()).rejects.toThrow(JUNO_AUTH_ERROR_NOT_CONTROLLER);
		});
	});

	describe('custom guard', () => {
		afterAll(() => {
			actor.setIdentity(controller);
		});

		it('should use custom guard to reject call', async () => {
			const { app_custom_guard } = actor;

			await expect(app_custom_guard()).rejects.toThrow('Not allowed with a custom guard');
		});
	});
});
