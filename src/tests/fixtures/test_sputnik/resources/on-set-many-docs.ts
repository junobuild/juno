import { assertNonNullish } from '@dfinity/utils';
import { defineHook, type OnSetManyDocs } from '@junobuild/functions';
import { callAndSaveVersion } from './services/set-doc.services';

/* eslint-disable no-console */

export const onSetManyDocs = defineHook<OnSetManyDocs>({
	collections: ['test-onsetmanydocs'],
	run: async ({ caller, data }) => {
		console.log('onSetManyDocs called');

		const [doc] = data;

		assertNonNullish(doc);

		const { collection, key } = doc;

		await callAndSaveVersion({
			caller,
			collection,
			key
		});
	}
});

/* eslint-enable */
