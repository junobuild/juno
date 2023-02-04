export type ToastLevel = 'info' | 'warn' | 'error';

export interface ToastMsg {
	text: string;
	level: ToastLevel;
	detail?: string;
	duration?: number;
}
