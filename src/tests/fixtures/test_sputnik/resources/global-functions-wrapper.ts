import { decodeDocData, encodeDocData } from '@junobuild/functions/sdk';

// @ts-ignore
globalThis.__juno_invoke_endpoint = async (config, raw) => {
	try {
		const input = config.input.parse(decodeDocData(raw));

		const output = await config.handler(input);

		const parsed = config.output.parse(output);

		// @ts-ignore
		globalThis.jsResult = encodeDocData(parsed);
	} catch (e) {
		console.log('ERROR __juno_invoke_endpoint', e);
	}
};
