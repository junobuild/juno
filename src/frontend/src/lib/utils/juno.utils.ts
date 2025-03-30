import { DEV, LOCAL_REPLICA_HOST } from '$lib/constants/app.constants';
import type { ActorParameters } from '@junobuild/admin';

export const container = (): Partial<Pick<ActorParameters, 'container'>> =>
	DEV ? { container: LOCAL_REPLICA_HOST } : {};
