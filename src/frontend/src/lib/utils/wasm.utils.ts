import { arrayBufferToUint8Array, isNullish, nonNullish } from '@dfinity/utils';
import { type BuildType, findJunoPackageDependency } from '@junobuild/admin';
import { JUNO_PACKAGE_SATELLITE_ID, type JunoPackage, JunoPackageSchema } from '@junobuild/config';
import { uint8ArrayToString } from 'uint8array-extras';

interface WasmMetadata {
	junoPackage: JunoPackage | undefined;
	buildType: BuildType | undefined;
}

export const readWasmMetadata = async ({ wasm: blob }: { wasm: Blob }): Promise<WasmMetadata> => {
	const buffer = await blob.arrayBuffer();

	const wasm = isGzip(buffer) ? await gunzip({ blob }) : buffer;

	const junoPackage = await readCustomSectionJunoPackage({ wasm });

	const buildType = await extractBuildType({ wasm, junoPackage });

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

const extractBuildType = async ({
	junoPackage,
	wasm
}: {
	junoPackage: JunoPackage | undefined;
	wasm: ArrayBuffer;
}): Promise<BuildType | undefined> => {
	if (isNullish(junoPackage)) {
		return await readDeprecatedBuildType({ wasm });
	}

	const { name, dependencies } = junoPackage;

	if (name === JUNO_PACKAGE_SATELLITE_ID) {
		return 'stock';
	}

	const satelliteDependency = findJunoPackageDependency({
		dependencies,
		dependencyId: JUNO_PACKAGE_SATELLITE_ID
	});

	return nonNullish(satelliteDependency) ? 'extended' : undefined;
};

/**
 * @deprecated Modern WASM build use JunoPackage.
 */
const readDeprecatedBuildType = async ({
	wasm
}: {
	wasm: ArrayBuffer;
}): Promise<BuildType | undefined> => {
	const buildType = await customSection({ wasm, sectionName: 'icp:public juno:build' });

	return nonNullish(buildType) && ['stock', 'extended'].includes(buildType)
		? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
			(buildType as BuildType)
		: undefined;
};

const readCustomSectionJunoPackage = async ({
	wasm
}: {
	wasm: ArrayBuffer;
}): Promise<JunoPackage | undefined> => {
	const section = await customSection({ wasm, sectionName: 'icp:public juno:package' });

	if (isNullish(section)) {
		return undefined;
	}

	const pkg = JSON.parse(section);

	const { success, data } = JunoPackageSchema.safeParse(pkg);
	return success ? data : undefined;
};

const customSection = async ({
	sectionName,
	wasm
}: {
	sectionName: string;
	wasm: ArrayBuffer;
}): Promise<string | undefined> => {
	const wasmModule = await WebAssembly.compile(wasm);

	const pkgSections = WebAssembly.Module.customSections(wasmModule, sectionName);

	const [pkgBuffer] = pkgSections;

	return nonNullish(pkgBuffer) ? uint8ArrayToString(pkgBuffer) : undefined;
};
