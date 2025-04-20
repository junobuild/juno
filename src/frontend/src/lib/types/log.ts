export type LogLevel = 'Debug' | 'Info' | 'Warning' | 'Error' | 'Unknown';

export interface LogDataDid {
	message: string;
	data: Uint8Array | number[] | undefined;
	level: LogLevel;
}

export interface Log {
	level: LogLevel;
	message: string;
	data?: Blob;
	timestamp: bigint;
}
