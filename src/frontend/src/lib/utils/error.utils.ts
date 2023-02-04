export const errorDetailToString = (err: unknown): string | undefined =>
	typeof err === 'string'
		? (err as string)
		: err instanceof Error
		? (err as Error).message
		: undefined;
