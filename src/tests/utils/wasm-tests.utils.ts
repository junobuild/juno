import { gunzipFile } from '@junobuild/cli-tools';
import type { JunoPackage } from '@junobuild/config';
import { readFile } from 'fs/promises';
import { uint8ArrayToString } from 'uint8array-extras';

export const customSectionJunoPackage = async (param: { path: string }): Promise<JunoPackage> => {
	const section = await customSection({ ...param, sectionName: 'icp:public juno:package' });
	return JSON.parse(section);
};

const customSection = async ({
	path,
	sectionName
}: {
	path: string;
	sectionName: string;
}): Promise<string> => {
	// Read WASM
	const buffer = await readFile(path);
	const wasm = await gunzipFile({ source: buffer });

	// Compile a WebAssembly.Module object
	const wasmModule = await WebAssembly.compile(wasm);

	// Read the public custom section
	const pkgSections = WebAssembly.Module.customSections(wasmModule, sectionName);

	expect(pkgSections).toHaveLength(1);

	// Parse content to object
	const [pkgBuffer] = pkgSections;
	return uint8ArrayToString(pkgBuffer);
};
