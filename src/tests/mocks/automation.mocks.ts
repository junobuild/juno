import type { SatelliteDid } from '$declarations';

export const mockRepositoryKey: SatelliteDid.RepositoryKey = {
	owner: 'junobuild',
	name: 'juno'
};

export interface AutomationWorkflowData {
	runNumber?: string;
	runAttempt?: string;
	ref?: string;
}

export const mockAutomationWorkflowData: Required<AutomationWorkflowData> & { runId: string } = {
	runId: '21776509605',
	runNumber: '1',
	runAttempt: '2',
	ref: 'refs/heads/main'
};