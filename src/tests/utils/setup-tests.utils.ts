import type { Identity } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { nonNullish } from '@dfinity/utils';
import { existsSync, writeFileSync } from 'node:fs';
import { get, type RequestOptions } from 'node:https';
import { join } from 'node:path';

const WASM_PATH_LOCAL = join(process.cwd(), 'target', 'deploy');

const SATELLITE_WASM_PATH_LOCAL = join(WASM_PATH_LOCAL, 'satellite.wasm.gz');
const SATELLITE_WASM_PATH_CI = join(process.cwd(), 'satellite.wasm.gz');
export const SATELLITE_WASM_PATH = existsSync(SATELLITE_WASM_PATH_CI)
	? SATELLITE_WASM_PATH_CI
	: SATELLITE_WASM_PATH_LOCAL;

const ORBITER_WASM_PATH_LOCAL = join(WASM_PATH_LOCAL, 'orbiter.wasm.gz');
const ORBITER_WASM_PATH_CI = join(process.cwd(), 'orbiter.wasm.gz');
export const ORBITER_WASM_PATH = existsSync(ORBITER_WASM_PATH_CI)
	? ORBITER_WASM_PATH_CI
	: ORBITER_WASM_PATH_LOCAL;

const CONSOLE_WASM_PATH_LOCAL = join(WASM_PATH_LOCAL, 'console.wasm.gz');
const CONSOLE_WASM_PATH_CI = join(process.cwd(), 'console.wasm.gz');
export const CONSOLE_WASM_PATH = existsSync(CONSOLE_WASM_PATH_CI)
	? CONSOLE_WASM_PATH_CI
	: CONSOLE_WASM_PATH_LOCAL;

export const controllersInitArgs = (controller: Identity): ArrayBuffer =>
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

export const downloadSatellite = async (version: string): Promise<string> =>
	downloadCdn(`satellite-v${version}.wasm.gz`);

export const downloadOrbiter = async (version: string): Promise<string> =>
	downloadCdn(`orbiter-v${version}.wasm.gz`);

export const downloadMissionControl = async (version: string): Promise<string> =>
	downloadCdn(`mission_control-v${version}.wasm.gz`);

export const downloadConsole = async ({
	junoVersion,
	version
}: {
	junoVersion: string;
	version: string;
}): Promise<string> => downloadGitHub({ junoVersion, wasm: `console-v${version}.wasm.gz` });

const downloadCdn = async (wasm: string): Promise<string> =>
	download({ wasm, url: `https://cdn.juno.build/releases/${wasm}` });

const downloadGitHub = async ({
	wasm,
	junoVersion
}: {
	wasm: string;
	junoVersion: string;
}): Promise<string> =>
	download({
		wasm,
		url: `https://github.com/junobuild/juno/releases/download/v${junoVersion}/${wasm}`
	});

const download = async ({ wasm, url }: { wasm: string; url: string }): Promise<string> => {
	const destination = join(process.cwd(), wasm);

	if (existsSync(destination)) {
		return destination;
	}

	const buffer = await downloadFromURL(url);

	writeFileSync(destination, buffer);

	return destination;
};
