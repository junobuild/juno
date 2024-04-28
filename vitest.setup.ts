import { PocketIcServer } from '@hadronous/pic';
import type { GlobalSetupContext } from 'vitest/node';

let pic: PocketIcServer | undefined;

export async function setup(ctx: GlobalSetupContext): Promise<void> {
	pic = await PocketIcServer.start();
	const url = pic.getUrl();

	ctx.provide('PIC_URL', url);
}

export async function teardown(): Promise<void> {
	await pic?.stop();
}
