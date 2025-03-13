import type { PocketIc } from '@hadronous/pic';
import { tick } from './pic-tests.utils';

export const waitServerlessFunction = async (pic: PocketIc) => {
	// Wait for the serverless function to being fired
	await tick(pic);
};
