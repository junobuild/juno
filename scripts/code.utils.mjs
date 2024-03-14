import { open, readFile } from 'node:fs/promises';

export const loadLocalWasm = async (type) => {
	const buffer = await readFile(`${process.cwd()}/.dfx/local/canisters/${type}/${type}.wasm`);
	return [...new Uint8Array(buffer)];
};

export const loadGzippedWasm = async (type) => {
	const buffer = await readFile(`${process.cwd()}/${type}.wasm.gz`);
	return [...new Uint8Array(buffer)];
};

export const readVersion = async (type) => {
	const file = await open(`${process.cwd()}/src/${type}/Cargo.toml`);

	try {
		for await (const line of file.readLines()) {
			let version = line.match(/version = "(.*)"/)?.[1];

			if (version !== undefined) {
				return version;
			}
		}

		return undefined;
	} finally {
		await file.close();
	}
};
