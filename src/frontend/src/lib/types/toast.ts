export type ToastLevel = 'info' | 'warn' | 'error';

export type ToastColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'success';

export interface ToastMsg {
	text: string;
	level: ToastLevel;
	color?: ToastColor;
	detail?: string;
	duration?: number;
}
