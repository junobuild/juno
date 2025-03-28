import { assertNonNullish } from '@dfinity/utils';
import { defineHook, type OnDeleteManyDocs } from '@junobuild/functions';
import { callAndSaveVersion } from './services/set-doc.services';

/* eslint-disable no-console */

export const onDeleteManyDocs = defineHook<OnDeleteManyDocs>({
	collections: ['test-ondeletemanydocs'],
	run: async ({ caller, data }) => {
		console.log('onDeleteManyDocs called');

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
