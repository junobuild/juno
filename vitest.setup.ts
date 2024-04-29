import { PocketIcServer } from '@hadronous/pic';
import type { GlobalSetupContext } from 'vitest/node';

let pic: PocketIcServer | undefined;

export async function setup({ provide }: GlobalSetupContext): Promise<void> {
	pic = await PocketIcServer.start();
	const url = pic.getUrl();

	provide('PIC_URL', url);
}

declare module 'vitest' {
	export interface ProvidedContext {
		PIC_URL: string;
	}
}

export async function teardown(): Promise<void> {
	await pic?.stop();
}
