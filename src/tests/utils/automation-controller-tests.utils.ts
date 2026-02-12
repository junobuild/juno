import type { SatelliteActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { type Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER } from '@junobuild/errors';
import type { TestAutomation } from './automation-tests.utils';
import { makeMockGitHubActionsOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';

export const authenticateAutomationAndMakeController = async ({
	pic,
	automation: { nonce, salt },
	actor
}: {
	pic: PocketIc;
	automation: TestAutomation;
	actor: Actor<SatelliteActor>;
}): Promise<void> => {
	await pic.advanceTime(15 * 60_000);
	await tick(pic);

	const now = await pic.getTime();

	const mockJwt = await makeMockGitHubActionsOpenIdJwt({
		date: new Date(now),
		nonce
	});

	const { jwks, jwt } = mockJwt;

	await assertOpenIdHttpsOutcalls({
		pic,
		jwks,
		method: 'github_actions'
	});

	const { authenticate_automation } = actor;

	const prepareAutomation = await authenticate_automation({
		OpenId: { jwt, salt }
	});

	if ('Err' in prepareAutomation) {
		expect(true).toBeFalsy();

		throw new Error('Unreachable');
	}
};

export const assertAutomationController = async ({
	controller,
	automationIdentity,
	satelliteActor
}: {
	controller: Ed25519KeyIdentity;
	automationIdentity: Ed25519KeyIdentity;
	satelliteActor: Actor<SatelliteActor>;
}) => {
	satelliteActor.setIdentity(automationIdentity);

	const { count_collection_docs, list_controllers } = satelliteActor;

	const count = await count_collection_docs('#automation-workflow');
	expect(count).toEqual(1n);

	await expect(list_controllers()).rejects.toThrowError(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);

	satelliteActor.setIdentity(controller);

	const { list_controllers: admin_list_controllers } = satelliteActor;

	const controllers = await admin_list_controllers();

	const automatedController = controllers.find(
		([p, _]) => p.toText() === automationIdentity.getPrincipal().toText()
	);

	expect(automatedController).not.toBeUndefined();
	expect('Write' in (automatedController?.[1].scope ?? {})).toBeTruthy();
};
