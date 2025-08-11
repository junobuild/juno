import { LOCAL_REPLICA_HOST } from '$lib/constants/app.constants';
import { isDev } from '$lib/env/app.env';
import type { ActorParameters } from '@junobuild/ic-client';

export const container = (): Partial<Pick<ActorParameters, 'container'>> =>
	isDev() ? { container: LOCAL_REPLICA_HOST } : {};
