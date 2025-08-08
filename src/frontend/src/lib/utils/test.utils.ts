import { isDev, isNotSkylab } from '$lib/env/app.env';
import type { TestId } from '$lib/types/test-id';
import { nonNullish } from '@dfinity/utils';

export const testId = (testId: TestId | undefined): { ['data-tid']?: string } => ({
	...(isDev() && isNotSkylab() && nonNullish(testId) && { 'data-tid': testId })
});
