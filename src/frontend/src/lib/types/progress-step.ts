export type ProgressStepState = 'next' | 'in_progress' | 'completed';

export interface ProgressStep {
	step: string;
	text: string;
	state: ProgressStepState;
}
