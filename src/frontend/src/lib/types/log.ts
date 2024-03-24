export type LogLevel = 'error' | 'warning' | 'debug' | 'info';

export interface LogDataDid {
	message: string;
	data: [] | [Uint8Array | number[]];
	level: { error: null } | { warning: null } | { debug: null } | { info: null };
}

export interface Log {
	level: LogLevel;
	message: string;
	data?: Blob;
	timestamp: bigint;
}
