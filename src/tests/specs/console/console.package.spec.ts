import { gunzipFile } from '@junobuild/cli-tools';
import { readFile } from 'node:fs/promises';
import { uint8ArrayToString } from 'uint8array-extras';
import { CONSOLE_WASM_PATH, readWasmVersion } from '../../utils/setup-tests.utils';

describe('Console > Package', () => {
	it('should expose public custom section', async () => {
		// Read WASM
		const buffer = await readFile(CONSOLE_WASM_PATH);
		const wasm = await gunzipFile({ source: buffer });

		// Compile a WebAssembly.Module object
		const wasmModule = await WebAssembly.compile(wasm);

		// Read the public custom section
		const pkgSections = WebAssembly.Module.customSections(wasmModule, 'icp:public juno:package');
		expect(pkgSections).toHaveLength(1);

		// Parse content to object
		const [pkgBuffer] = pkgSections;
		const pkgJson = JSON.parse(uint8ArrayToString(pkgBuffer));

		// Expected result
		const expectedPkg = {
			name: '@junobuild/console',
			version: readWasmVersion('console')
		};

		expect(pkgJson).toEqual(expectedPkg);
	});
});
