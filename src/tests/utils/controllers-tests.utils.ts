import type {
	ConsoleActor,
	ObservatoryActor,
	OrbiterActor,
	OrbiterDid,
	SatelliteActor
} from '$declarations';
import type { Actor } from '@dfinity/pic';
import { assertNonNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';

export const testControllers = ({
	actor,
	controller
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor | ObservatoryActor | OrbiterActor>;
	controller: () => Identity;
}) => {
	it('should add and remove additional controller', async () => {
		const { set_controllers, del_controllers, list_controllers } = actor();

		const newController = Ed25519KeyIdentity.generate();

		const controllerData: OrbiterDid.SetController = {
			scope: { Admin: null },
			expires_at: [123n],
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
};
