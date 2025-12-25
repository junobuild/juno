export type ProgressStepState = 'next' | 'in_progress' | 'completed' | 'error' | 'warning';

export interface ProgressStep {
	step: string;
	text: string;
	state: ProgressStepState;
}
