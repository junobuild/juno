export const errorDetailToString = (err: unknown): string | undefined =>
	typeof err === 'string' ? err : err instanceof Error ? err.message : undefined;
