import { jsonReplacer } from '@dfinity/utils';

export const toBodyJson = <T>(obj: T): Uint8Array<ArrayBufferLike> =>
	new TextEncoder().encode(JSON.stringify(obj, jsonReplacer));
