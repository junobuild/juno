import { assertNonNullish } from '@dfinity/utils';
import { defineHook, type OnDeleteFilteredDocs } from '@junobuild/functions';
import { callAndSaveVersion } from './services/set-doc.services';

/* eslint-disable no-console */

export const onDeleteFilteredDocs = defineHook<OnDeleteFilteredDocs>({
	collections: ['test-ondeletefiltereddocs'],
	run: async ({ caller, data }) => {
		console.log('onDeleteFilteredDocs called');

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
