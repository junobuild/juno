import { assertNonNullish } from '@dfinity/utils';
import { defineHook, type OnDeleteDoc } from '@junobuild/functions';
import { callAndSaveVersion } from './services/set-doc.services';

/* eslint-disable no-console */

export const onDeleteDoc = defineHook<OnDeleteDoc>({
	collections: ['test-ondeletedoc'],
	run: async ({ caller, data }) => {
		console.log('onDeleteDoc called');

		const doc = data;

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
