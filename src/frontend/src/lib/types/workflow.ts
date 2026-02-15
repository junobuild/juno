
export type WorkflowProvider = 'GitHub';

type Owner = string;
type Name = string;
export type Repository = `${Owner}/${Name}`;

export type RunId = string;

export type WorkflowKey = `${WorkflowProvider}#${Repository}#${RunId}`;

export interface WorkflowData {
	runNumber?: string;
	runAttempt?: string;
	ref?: string;
	sha?: string;
	actor?: string;
	workflow?: string;
	eventName?: string;
}