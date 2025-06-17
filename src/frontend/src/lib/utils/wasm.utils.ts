import { arrayBufferToUint8Array } from '@dfinity/utils';
import { type BuildType, extractBuildType, readCustomSectionJunoPackage } from '@junobuild/admin';
import type { JunoPackage } from '@junobuild/config';

interface WasmMetadata {
	junoPackage: JunoPackage | undefined;
	buildType: BuildType | undefined;
}

export const readWasmMetadata = async ({ wasm: blob }: { wasm: Blob }): Promise<WasmMetadata> => {
	const buffer = await blob.arrayBuffer();

	const wasm = isGzip(buffer) ? await gunzip({ blob }) : buffer;

	const wasmArray = arrayBufferToUint8Array(wasm);

	const junoPackage = await readCustomSectionJunoPackage({ wasm: wasmArray });

	const buildType = await extractBuildType({ wasm: wasmArray, junoPackage });

	return {
		junoPackage,
		buildType
	};
};

const gunzip = async ({ blob }: { blob: Blob }): Promise<ArrayBuffer> => {
	const ds = new DecompressionStream('gzip');
	const decompressedStream = blob.stream().pipeThrough(ds);
	return await new Response(decompressedStream).arrayBuffer();
};

const isGzip = (buffer: ArrayBuffer): boolean => {
	const bytes = arrayBufferToUint8Array(buffer);
	return bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
};
