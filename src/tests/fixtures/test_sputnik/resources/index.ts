import { decodeDocData, defineAssert } from '@junobuild/functions';

export const assertSetDoc = defineAssert({
	collections: ['demo'],
	assertSetDoc: (context) => {
		decodeDocData;
		console.log('Asserting data for', context.data.key);
	}
});
