import { decodeDocData, encodeDocData } from '@junobuild/functions/sdk';

// @ts-ignore
globalThis.__juno_satellite_fn_invoke_sync = (config, raw) => {
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
globalThis.__juno_satellite_fn_invoke_async = async (config, raw) => {
	try {
		const args = config.args?.parse(raw !== undefined ? decodeDocData(raw) : undefined);

		console.log('-----------------> ARGS:', raw, args === undefined);

		// Maybe do not pass args if undefined
		const result = await config.handler(args);

		const parsed = config.result?.parse(result);

		// @ts-ignore
		globalThis.jsResult = parsed !== null && parsed !== undefined ? encodeDocData(parsed) : parsed;
	} catch (e) {
		console.log('ERROR __juno_invoke_endpoint', e);
	}
};
