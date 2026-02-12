import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { GITHUB_ACTIONS_OPEN_ID_PROVIDER } from '../constants/auth-tests.constants';
import { OBSERVATORY_ID } from '../constants/observatory-tests.constants';
import { mockRepositoryKey } from '../mocks/automation.mocks';
import { mockCertificateDate } from '../mocks/jwt.mocks';
import { generateNonce } from './auth-nonce-tests.utils';
import { updateRateConfigNoLimit } from './rate.tests.utils';
import { setupSatelliteStock } from './satellite-tests.utils';
import { OBSERVATORY_WASM_PATH } from './setup-tests.utils';

export interface TestAutomation {
	automationIdentity: Ed25519KeyIdentity;
	nonce: string;
	salt: Uint8Array;
}

interface SetupAutomation {
	pic: PocketIc;
	controller: Ed25519KeyIdentity;
	observatory: { canisterId: Principal; actor: Actor<ObservatoryActor> };
	automation: TestAutomation;
}

export const setupSatelliteAutomation = async ({
	controllerConfig
}: {
	controllerConfig?: SatelliteDid.OpenIdAutomationProviderControllerConfig;
} = {}): Promise<
	SetupAutomation & {
		satellite: { canisterId: Principal; actor: Actor<SatelliteActor> };
	}
> => {
	const {
		actor: a,
		pic: p,
		controller: cO,
		canisterId: cId
	} = await setupSatelliteStock({
		dateTime: mockCertificateDate,
		withIndexHtml: false,
		memory: { Heap: null }
	});

	const pic = p;
	const controller = cO;
	const satelliteActor = a;
	const satelliteCanisterId = cId;

	const common = await setupAutomation({
		pic,
		controller,
		actor: satelliteActor,
		controllerConfig
	});

	return {
		...common,
		satellite: { canisterId: satelliteCanisterId, actor: satelliteActor }
	};
};

const setupAutomation = async ({
	pic,
	controller,
	actor,
	controllerConfig
}: {
	pic: PocketIc;
	controller: Ed25519KeyIdentity;
	actor: Actor<SatelliteActor>;
	controllerConfig?: SatelliteDid.OpenIdAutomationProviderControllerConfig;
}): Promise<SetupAutomation> => {
	const automationIdentity = Ed25519KeyIdentity.generate();

	const { nonce, salt } = await generateNonce({ caller: automationIdentity });

	const { actor: obsA } = await pic.setupCanister<ObservatoryActor>({
		idlFactory: idlFactoryObservatory,
		wasm: OBSERVATORY_WASM_PATH,
		sender: controller.getPrincipal(),
		targetCanisterId: OBSERVATORY_ID
	});

	const observatoryActor = obsA;
	observatoryActor.setIdentity(controller);

	// Enable authentication with OpenID
	actor.setIdentity(controller);

	const config: SatelliteDid.SetAutomationConfig = {
		openid: [
			{
				providers: [
					[
						{ GitHub: null },
						{
							repositories: [[mockRepositoryKey, { branches: [] }]],
							controller: toNullable(controllerConfig)
						}
					]
				],
				observatory_id: []
			}
		],
		version: [1n]
	};

	const { set_automation_config } = actor;
	await set_automation_config(config);

	// Start fetching OpenID Jwts in Observatory
	const { start_openid_monitoring } = observatoryActor;
	await start_openid_monitoring(GITHUB_ACTIONS_OPEN_ID_PROVIDER);

	await updateRateConfigNoLimit({ actor: observatoryActor });

	actor.setIdentity(automationIdentity);

	return {
		pic,
		controller,
		observatory: { actor: observatoryActor, canisterId: OBSERVATORY_ID },
		automation: {
			nonce,
			salt,
			automationIdentity
		}
	};
};
