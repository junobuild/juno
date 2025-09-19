import type { Identity } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, nonNullish, toNullable } from '@dfinity/utils';
import { parse } from '@ltd/j-toml';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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

const MISSION_CONTROL_WASM_PATH_LOCAL = join(WASM_PATH_LOCAL, 'mission_control.wasm.gz');
const MISSION_CONTROL_WASM_PATH_CI = join(process.cwd(), 'mission_control.wasm.gz');
export const MISSION_CONTROL_WASM_PATH = existsSync(MISSION_CONTROL_WASM_PATH_CI)
	? MISSION_CONTROL_WASM_PATH_CI
	: MISSION_CONTROL_WASM_PATH_LOCAL;

const OBSERVATORY_WASM_PATH_LOCAL = join(WASM_PATH_LOCAL, 'observatory.wasm.gz');
const OBSERVATORY_WASM_PATH_CI = join(process.cwd(), 'observatory.wasm.gz');
export const OBSERVATORY_WASM_PATH = existsSync(OBSERVATORY_WASM_PATH_CI)
	? OBSERVATORY_WASM_PATH_CI
	: OBSERVATORY_WASM_PATH_LOCAL;

const TEST_SATELLITE_WASM_PATH_LOCAL = join(WASM_PATH_LOCAL, 'test_satellite.wasm.gz');
const TEST_SATELLITE_WASM_PATH_CI = join(process.cwd(), 'test_satellite.wasm.gz');
export const TEST_SATELLITE_WASM_PATH = existsSync(SATELLITE_WASM_PATH_CI)
	? TEST_SATELLITE_WASM_PATH_CI
	: TEST_SATELLITE_WASM_PATH_LOCAL;

const SPUTNIK_WASM_PATH_LOCAL = join(WASM_PATH_LOCAL, 'sputnik.wasm.gz');
const SPUTNIK_WASM_PATH_CI = join(process.cwd(), 'sputnik.wasm.gz');
export const SPUTNIK_WASM_PATH = existsSync(SPUTNIK_WASM_PATH_CI)
	? SPUTNIK_WASM_PATH_CI
	: SPUTNIK_WASM_PATH_LOCAL;

const TEST_SPUTNIK_WASM_PATH_LOCAL = join(WASM_PATH_LOCAL, 'test_sputnik.wasm.gz');
const TEST_SPUTNIK_WASM_PATH_CI = join(process.cwd(), 'test_sputnik.wasm.gz');
export const TEST_SPUTNIK_WASM_PATH = existsSync(SPUTNIK_WASM_PATH_CI)
	? TEST_SPUTNIK_WASM_PATH_CI
	: TEST_SPUTNIK_WASM_PATH_LOCAL;

export const controllersInitArgs = (controllers: Identity | Principal[]): ArrayBuffer =>
	IDL.encode(
		[
			IDL.Record({
				controllers: IDL.Vec(IDL.Principal)
			})
		],
		[{ controllers: Array.isArray(controllers) ? controllers : [controllers.getPrincipal()] }]
	).buffer as ArrayBuffer;

export const satelliteInitArgs = ({
	controllers,
	memory
}: {
	controllers: Identity | Principal[];
	memory: { Heap: null } | { Stable: null } | null;
}): ArrayBuffer =>
	IDL.encode(
		[
			IDL.Record({
				controllers: IDL.Vec(IDL.Principal),
				storage: IDL.Opt(
					IDL.Record({
						system_memory: IDL.Opt(
							IDL.Variant({
								Heap: IDL.Null,
								Stable: IDL.Null
							})
						)
					})
				)
			})
		],
		[
			{
				controllers: Array.isArray(controllers) ? controllers : [controllers.getPrincipal()],
				storage: toNullable(
					nonNullish(memory)
						? {
								system_memory: toNullable(memory)
							}
						: undefined
				)
			}
		]
	).buffer as ArrayBuffer;

const downloadFromURL = async (url: string | RequestOptions): Promise<Buffer> =>
	await new Promise((resolve, reject) => {
		get(url, async (res) => {
			if (nonNullish(res.statusCode) && [301, 302].includes(res.statusCode)) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

export const downloadSatellite = async (version: string): Promise<string> =>
	await downloadCdn(`satellite-v${version}.wasm.gz`);

export const downloadOrbiter = async (version: string): Promise<string> =>
	await downloadCdn(`orbiter-v${version}.wasm.gz`);

export const downloadMissionControl = async (version: string): Promise<string> =>
	await downloadCdn(`mission_control-v${version}.wasm.gz`);

export const downloadConsole = async ({
	junoVersion,
	version
}: {
	junoVersion: string;
	version: string;
}): Promise<string> => await downloadGitHub({ junoVersion, wasm: `console-v${version}.wasm.gz` });

export const downloadObservatory = async ({
	junoVersion,
	version
}: {
	junoVersion: string;
	version: string;
}): Promise<string> =>
	await downloadGitHub({ junoVersion, wasm: `observatory-v${version}.wasm.gz` });

const downloadCdn = async (wasm: string): Promise<string> =>
	await download({ wasm, url: `https://cdn.juno.build/releases/${wasm}` });

const downloadGitHub = async ({
	wasm,
	junoVersion
}: {
	wasm: string;
	junoVersion: string;
}): Promise<string> =>
	await download({
		wasm,
		url: `https://github.com/junobuild/juno/releases/download/v${junoVersion}/${wasm}`
	});

export const download = async ({ wasm, url }: { wasm: string; url: string }): Promise<string> => {
	const destination = join(process.cwd(), wasm);

	if (existsSync(destination)) {
		return destination;
	}

	const buffer = await downloadFromURL(url);

	writeFileSync(destination, buffer);

	return destination;
};

export const readWasmVersion = (segment: string): string => {
	const tomlFile = readFileSync(join(process.cwd(), 'src', segment, 'Cargo.toml'));

	type Toml = { package: { version: string } } | undefined;

	const result: Toml = parse(tomlFile.toString()) as unknown as Toml;

	const version = result?.package?.version;

	assertNonNullish(version);

	return version;
};

export const WASM_VERSIONS = {
	console: readWasmVersion('console'),
	orbiter: readWasmVersion('orbiter'),
	satellite: readWasmVersion('satellite'),
	mission_control: readWasmVersion('mission_control')
};
