import type { Identity } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { nonNullish } from '@dfinity/utils';
import { existsSync, writeFileSync } from 'node:fs';
import { get, type RequestOptions } from 'node:https';
import { resolve } from 'node:path';

const WASM_PATH_LOCAL = resolve(
	process.cwd(),
	'.dfx',
	'local',
	'canisters',
	'satellite',
	'satellite.wasm'
);

const WASM_PATH_CI = resolve(process.cwd(), 'satellite.wasm.gz');

export const WASM_PATH = existsSync(WASM_PATH_CI) ? WASM_PATH_CI : WASM_PATH_LOCAL;

export const satelliteInitArgs = (controller: Identity): ArrayBuffer =>
	IDL.encode(
		[
			IDL.Record({
				controllers: IDL.Vec(IDL.Principal)
			})
		],
		[{ controllers: [controller.getPrincipal()] }]
	);

const downloadFromURL = async (url: string | RequestOptions): Promise<Buffer> => {
	return await new Promise((resolve, reject) => {
		get(url, async (res) => {
			if (nonNullish(res.statusCode) && [301, 302].includes(res.statusCode)) {
				await downloadFromURL(res.headers.location!).then(resolve, reject);
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const data: any[] = [];

			res.on('data', (chunk) => data.push(chunk));
			res.on('end', () => {
				resolve(Buffer.concat(data));
			});
			res.on('error', reject);
		});
	});
};

export const downloadSatellite = async (version: string) => {
	const destination = resolve(process.cwd(), `satellite-v${version}.wasm.gz`);

	if (existsSync(destination)) {
		return destination;
	}

	const buffer = await downloadFromURL(
		`https://cdn.juno.build/releases/satellite-v${version}.wasm.gz`
	);

	writeFileSync(destination, buffer);

	return destination;
};
