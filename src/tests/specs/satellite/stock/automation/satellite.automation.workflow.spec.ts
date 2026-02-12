import type { SatelliteActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { fromArray } from '@junobuild/utils';
import { mockAutomationWorkflowData, mockRepositoryKey } from '../../../../mocks/automation.mocks';
import { mockListParams } from '../../../../mocks/list.mocks';
import { authenticateAutomationAndMakeController } from '../../../../utils/automation-controller-tests.utils';
import {
	setupSatelliteAutomation,
	type TestAutomation
} from '../../../../utils/automation-tests.utils';

describe('Satellite > Automation > Workflow', () => {
	let pic: PocketIc;
	let satelliteActor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;

	let automation: TestAutomation;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor },
			automation: s,
			controller: c
		} = await setupSatelliteAutomation();

		pic = p;
		satelliteActor = actor;
		controller = c;

		automation = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should authenticate automation and log the deployment', async () => {
		await authenticateAutomationAndMakeController({
			pic,
			actor: satelliteActor,
			automation
		});

		satelliteActor.setIdentity(automation.automationIdentity);

		const { list_docs } = satelliteActor;

		const docs = await list_docs('#automation-workflow', mockListParams);

		expect(docs.items_length).toEqual(1n);

		const { items } = docs;
		const [[key, doc]] = items;

		const { runId, ...rest } = mockAutomationWorkflowData;

		expect(key).toEqual(`GitHub#${mockRepositoryKey.owner}/${mockRepositoryKey.name}#${runId}`);

		const data = await fromArray(doc.data);
		expect(data).toEqual(rest);
	});
});
