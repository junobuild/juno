import { defineAssert } from '@junobuild/functions';

export const assertSetDoc = defineAssert({
	collections: ['demo'],
	assertSetDoc: (context) => {
		// eslint-disable-next-line no-console
		console.log('Asserting data for', context.data.key);
	}
});
