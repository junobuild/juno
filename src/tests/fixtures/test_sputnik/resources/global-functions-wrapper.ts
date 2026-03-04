import { decodeDocData, encodeDocData } from '@junobuild/functions/sdk';

// @ts-ignore
globalThis.__juno_invoke_endpoint = (config, raw) => {
	try {
		const args = config.args.parse(decodeDocData(raw));

		const result = config.handler(args);

		const parsed = config.result.parse(result);

		// @ts-ignore
		globalThis.jsResult = encodeDocData(parsed);
	} catch (e) {
		console.log('ERROR __juno_invoke_endpoint', e);
	}
};

// @ts-ignore
globalThis.__juno_invoke_endpoint_async = async (config, raw) => {
	try {
		const args = config.args.parse(raw !== null ? decodeDocData(raw) : null);

		const result = await config.handler(args);

		const parsed = config.result.parse(result);

		// @ts-ignore
		globalThis.jsResult = parsed !== null && parsed !== null ? encodeDocData(parsed) : parsed;
	} catch (e) {
		console.log('ERROR __juno_invoke_endpoint', e);
	}
};
