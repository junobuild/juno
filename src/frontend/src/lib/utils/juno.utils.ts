import type { ActorParameters } from '@junobuild/admin';

export const container = (): Partial<Pick<ActorParameters, 'container'>> =>
	import.meta.env.DEV ? { container: 'http://localhost:8000' } : {};
