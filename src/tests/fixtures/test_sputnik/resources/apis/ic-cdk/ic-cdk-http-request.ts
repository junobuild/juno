import { defineQuery, defineUpdate } from '@junobuild/functions';
import {
	HttpRequestArgsSchema,
	httpRequest as httpRequestLib,
	HttpRequestResultSchema,
	TransformArgsSchema
} from '@junobuild/functions/ic-cdk';

export const httpRequest = defineUpdate({
	args: HttpRequestArgsSchema,
	result: HttpRequestResultSchema,
	handler: async (args) => await httpRequestLib(args)
});

export const myHttpTransform = defineQuery({
	hidden: true,
	args: TransformArgsSchema,
	result: HttpRequestResultSchema,
	handler: (raw) => {
		const { response } = raw;

		return {
			status: response.status,
			body: response.body,
			headers: []
		};
	}
});
