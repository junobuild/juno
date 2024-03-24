export type LogLevel = 'error' | 'warning' | 'debug' | 'info';

export interface Log {
	level: LogLevel;
	message: string;
	data?: Blob;
	timestamp: bigint;
}
