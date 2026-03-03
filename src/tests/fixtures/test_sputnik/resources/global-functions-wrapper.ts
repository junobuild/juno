import { decodeDocData } from '@junobuild/functions/sdk';

// @ts-ignore
globalThis.__juno_invoke_endpoint = async (config, raw) => {
	console.log('------___------>', raw, config);

	try {
		const input = config.input.parse(decodeDocData(raw));
		console.log('------///------>', input);
		const output = await config.handler(input);
	} catch(e) {
		console.log('ERROR', e);
	}



	// const result = JSON.stringify(config.outputSchema.parse(output), jsonReplacer);
	// pass result back somehow
};
