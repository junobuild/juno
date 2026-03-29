import { defineUpdate } from '@junobuild/functions';
import {
	HttpRequestArgsSchema,
	httpRequest as httpRequestLib,
	HttpRequestResultSchema
} from '@junobuild/functions/ic-cdk';

export const httpRequest = defineUpdate({
	args: HttpRequestArgsSchema,
	result: HttpRequestResultSchema,
	handler: async (args) => {
		return await httpRequestLib(args);
	}
});
