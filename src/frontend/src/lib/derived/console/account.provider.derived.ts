import { account } from '$lib/derived/console/account.derived';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const provider = derived([account], ([$account]) => fromNullable($account?.provider ?? []));
