import { defineAssert } from '@junobuild/functions';

export const assertSetDoc = defineAssert({
	collections: ['demo'],
	assertSetDoc: (context) => {
		console.log('Asserting data for', context.data.key);
	}
});
