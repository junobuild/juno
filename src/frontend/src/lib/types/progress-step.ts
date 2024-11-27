export type ProgressStepState = 'next' | 'in_progress' | 'completed' | 'error';

export interface ProgressStep {
	step: string;
	text: string;
	state: ProgressStepState;
}
