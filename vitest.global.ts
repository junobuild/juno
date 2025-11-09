import { PocketIcServer } from '@dfinity/pic';
import type { GlobalSetupContext } from 'vitest/node';

let pic: PocketIcServer | undefined;

// eslint-disable-next-line func-style, prefer-arrow/prefer-arrow-functions
export async function setup({ provide }: GlobalSetupContext): Promise<void> {
	pic = await PocketIcServer.start({
		showCanisterLogs: true
	});
	const url = pic.getUrl();

	provide('PIC_URL', url);
}

declare module 'vitest' {
	export interface ProvidedContext {
		PIC_URL: string;
	}
}

// eslint-disable-next-line func-style, prefer-arrow/prefer-arrow-functions
export async function teardown(): Promise<void> {
	await pic?.stop();
}
