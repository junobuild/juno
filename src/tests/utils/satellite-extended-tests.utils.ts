import type { PocketIc } from '@dfinity/pic';
import { tick } from './pic-tests.utils';

export const waitServerlessFunction = async (pic: PocketIc) => {
	// Wait for the serverless function to being fired
	await tick(pic);
};
