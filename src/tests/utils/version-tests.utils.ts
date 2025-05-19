import { assertNonNullish } from '@dfinity/utils';
import { parse } from '@ltd/j-toml';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const crateVersion = (crate: string): string => {
	const tomlFile = readFileSync(join(process.cwd(), 'src', crate, 'Cargo.toml'));

	type Toml = { package: { version: string } } | undefined;

	const result: Toml = parse(tomlFile.toString()) as unknown as Toml;

	assertNonNullish(result?.package?.version);

	return result.package.version;
};
