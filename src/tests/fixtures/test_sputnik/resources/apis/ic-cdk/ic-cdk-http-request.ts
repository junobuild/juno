import { defineQuery, defineUpdate } from '@junobuild/functions';
import {
	HttpHeaderSchema,
	HttpMethodSchema,
	HttpRequestArgsSchema,
	httpRequest as httpRequestLib,
	HttpRequestResultSchema,
	TransformArgsSchema
} from '@junobuild/functions/ic-cdk';
import { j } from '@junobuild/schema';

export const httpYoloRequest = defineUpdate({
	args: HttpRequestArgsSchema,
	result: HttpRequestResultSchema,
	handler: async (args) => {
		return await httpRequestLib(args);
	}
});

const HttpRequestArgsSchemaFuck = j.object({
	url: j.string(),
	method: HttpMethodSchema,
	headers: j.array(HttpHeaderSchema),
	body: j.uint8Array().optional()
});

export const httpWorldRequest = defineUpdate({
	args: HttpRequestArgsSchemaFuck,
	handler: (args) => {
		console.log('----------------------->', args);
	}
});

export const myHttpTransform = defineQuery({
	hidden: true,
	args: TransformArgsSchema,
	result: HttpRequestResultSchema,
	handler: async (raw) => {
		const response = raw.response;

		console.log('myHttpTransform', response);

		return {
			status: response.status,
			body: response.body,
			headers: []
		};
	}
});
