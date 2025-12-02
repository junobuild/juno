import { jsonReplacer, nonNullish } from '@dfinity/utils';
import { AgentError } from '@icp-sdk/core/agent';

export const errorDetailToString = (err: unknown): string | undefined =>
	typeof err === 'string'
		? err
		: err instanceof AgentError
			? err.code.toErrorMessage()
			: err instanceof Error
				? nonNullish(err.cause)
					? `${err.message}: ${
							err.cause instanceof Error
								? err.cause.message
								: JSON.stringify(err.cause, jsonReplacer)
						}`
					: err.message
				: undefined;
