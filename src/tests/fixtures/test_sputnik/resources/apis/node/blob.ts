/* eslint-disable require-await, no-console */

import { mockBlob } from '../../../../../mocks/storage.mocks';

export const testBlob = async () => {
	console.log('Size:', mockBlob.size);
	console.log('Type:', mockBlob.type);
	console.log('Text:', await mockBlob.text());
	console.log('ArrayBuffer:', await mockBlob.arrayBuffer());
	console.log('Bytes:', await mockBlob.bytes());
};

/* eslint-enable */
