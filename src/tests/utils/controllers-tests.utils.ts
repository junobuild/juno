import type {
	ConsoleActor,
	ObservatoryActor,
	OrbiterActor,
	OrbiterDid,
	SatelliteActor
} from '$declarations';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import type { Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish } from '@dfinity/utils';
import { AnonymousIdentity, type Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import {
	JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY,
	JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED,
	JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST,
	JUNO_ERROR_CONTROLLERS_MAX_NUMBER
} from '@junobuild/errors';
import { CONTROLLER_METADATA } from '../constants/controller-tests.constants';
import { tick } from './pic-tests.utils';

/* eslint-disable vitest/require-top-level-describe */

export const testControllers = ({
	actor,
	controller,
	pic
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor | ObservatoryActor | OrbiterActor>;
	controller: () => Identity;
	pic: () => PocketIc;
}) => {
	it('should add and remove additional controller', async () => {
		const { set_controllers, del_controllers, list_controllers } = actor();

		const newController = Ed25519KeyIdentity.generate();

		const controllerData: OrbiterDid.SetController = {
			scope: { Admin: null },
			expires_at: [],
			kind: [{ Automation: null }],
			metadata: [['hello', 'world']]
		};

		await set_controllers({
			controllers: [newController.getPrincipal()],
			controller: controllerData
		});

		const addControllers = await list_controllers();

		expect(addControllers).toHaveLength(2);

		expect(
			addControllers.find(([p]) => p.toText() === controller().getPrincipal().toText())
		).not.toBeUndefined();

		const newAddedController = addControllers.find(
			([p]) => p.toText() === newController.getPrincipal().toText()
		);

		assertNonNullish(newAddedController);

		expect(newAddedController[1].metadata).toEqual(controllerData.metadata);
		expect(newAddedController[1].scope).toEqual(controllerData.scope);
		expect(newAddedController[1].expires_at).toEqual(controllerData.expires_at);
		expect(newAddedController[1].kind).toEqual(controllerData.kind);

		await del_controllers({
			controllers: [newController.getPrincipal()]
		});

		const updatedControllers = await list_controllers();

		expect(updatedControllers).toHaveLength(1);
		expect(updatedControllers[0][0].toText()).toEqual(controller().getPrincipal().toText());
	});

	describe('assert', () => {
		it('should throw errors on creating admin controller with expiration date', async () => {
			const { set_controllers } = actor();

			const controller = Ed25519KeyIdentity.generate();

			await expect(
				set_controllers({
					controllers: [controller.getPrincipal()],
					controller: {
						...CONTROLLER_METADATA,
						scope: { Admin: null },
						expires_at: [1n]
					}
				})
			).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY);
		});

		it('should throw error when creating too many admin controllers', async () => {
			const { set_controllers } = actor();

			const controllers = Array.from({ length: 11 }, () =>
				Ed25519KeyIdentity.generate().getPrincipal()
			);

			await expect(
				set_controllers({
					controllers,
					controller: {
						...CONTROLLER_METADATA,
						scope: { Admin: null }
					}
				})
			).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_MAX_NUMBER);
		});

		it.each([
			{ title: 'write', scope: { Write: null } },
			{ title: 'submit', scope: { Submit: null } }
		])(
			'should throw errors on creating controller with expiry in the past for $title',
			async ({ scope }) => {
				const { set_controllers } = actor();

				const controller = Ed25519KeyIdentity.generate();

				const now = toBigIntNanoSeconds(new Date(await pic().getTime()));

				await pic().advanceTime(10_000);
				await tick(pic());

				await expect(
					set_controllers({
						controllers: [controller.getPrincipal()],
						controller: {
							...CONTROLLER_METADATA,
							scope,
							expires_at: [now]
						}
					})
				).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST);
			}
		);

		it('should throw errors on creating anonymous controller', async () => {
			const { set_controllers } = actor();

			const controller = new AnonymousIdentity();

			await expect(
				set_controllers({
					controllers: [controller.getPrincipal()],
					controller: {
						...CONTROLLER_METADATA,
						scope: { Admin: null },
						expires_at: [1n]
					}
				})
			).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED);
		});

		it.each([
			{ title: 'write', scope: { Write: null } },
			{ title: 'submit', scope: { Submit: null } }
		])('should throw error when creating too many controllers for $write', async ({ scope }) => {
			const { set_controllers } = actor();

			const controllers = Array.from({ length: 21 }, () =>
				Ed25519KeyIdentity.generate().getPrincipal()
			);

			await expect(
				set_controllers({
					controllers,
					controller: {
						...CONTROLLER_METADATA,
						scope
					}
				})
			).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_MAX_NUMBER);
		});
	});
};
