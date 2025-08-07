import { isDev, isNotSkylab } from '$lib/env/app.env';
import type { TestId } from '$lib/types/test-id';

export const testId = (testId: TestId): TestId | undefined =>
	isDev() && isNotSkylab() ? testId : undefined;
