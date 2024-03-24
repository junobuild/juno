import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { open, readFile, rm } from 'node:fs/promises';
import { createGzip } from 'node:zlib';

export const loadLocalWasm = async (type) => {
	const buffer = await readFile(`${process.cwd()}/.dfx/local/canisters/${type}/${type}.wasm`);
	return [...new Uint8Array(buffer)];
};

export const loadGzippedWasm = async (destination) => {
	const buffer = await readFile(destination);
	return [...new Uint8Array(buffer)];
};

export const gzipAndLoadLocalWasm = async (type) => {
	const source = `${process.cwd()}/.dfx/local/canisters/${type}/${type}.wasm`;
	const destination = `${source}.gz`;

	if (existsSync(destination)) {
		await rm(destination);
	}

	await gzipFile({ source, destination });

	return await loadGzippedWasm(destination);
};

const gzipFile = async ({ source, destination }) =>
	await new Promise((resolve, reject) => {
		const sourceStream = createReadStream(source);

		const destinationStream = createWriteStream(destination);

		const gzip = createGzip();

		sourceStream.pipe(gzip).pipe(destinationStream);

		destinationStream.on('close', () => {
			resolve(destination);
		});
		destinationStream.on('error', reject);
	});

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
