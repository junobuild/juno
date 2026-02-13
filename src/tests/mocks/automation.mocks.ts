import type { SatelliteDid } from '$declarations';

export const mockRepositoryKey: SatelliteDid.RepositoryKey = {
	owner: 'junobuild',
	name: 'juno'
};

export interface AutomationWorkflowData {
	runNumber?: string;
	runAttempt?: string;
	ref?: string;
	sha?: string;
	actor?: string;
	workflow?: string;
	eventName?: string;
}

export const mockAutomationWorkflowData: Required<AutomationWorkflowData> & { runId: string } = {
	runId: '21776509605',
	runNumber: '1',
	runAttempt: '2',
	ref: 'refs/heads/main',
	sha: '73db4aaaba5ab025154971d0b3b3250b7796e244',
	actor: 'peterpeterparker',
	workflow: 'Deploy to Juno',
	eventName: 'workflow_dispatch'
};
