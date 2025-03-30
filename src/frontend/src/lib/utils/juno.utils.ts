import { DEV } from '$lib/constants/app.constants';
import type { ActorParameters } from '@junobuild/admin';

export const container = (): Partial<Pick<ActorParameters, 'container'>> =>
	DEV ? { container: 'http://localhost:5987' } : {};
