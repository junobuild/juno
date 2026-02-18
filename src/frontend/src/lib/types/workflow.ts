import type { SatelliteDid } from '$declarations';

type WorkflowProvider = 'GitHub';

type DocOwnerKey = string;
type DocNameKey = string;
export type DocRepositoryKey = `${DocOwnerKey}/${DocNameKey}`;

export type RunId = string;

export type WorkflowKey = `${WorkflowProvider}#${DocRepositoryKey}#${RunId}`;

export interface WorkflowData {
	runNumber?: string;
	runAttempt?: string;
	ref?: string;
	sha?: string;
	actor?: string;
	workflow?: string;
	eventName?: string;
}

export type Workflow = Omit<SatelliteDid.Doc, 'data'> & {
	data: WorkflowData;
};

export type WorkflowReferences = [string, ...string[]];
