import { buildEsm } from '@junobuild/cli-tools';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'target', 'fixtures');

if (existsSync(dist)) {
	rmSync(dist, { recursive: true, force: true });
}

mkdirSync(dist, { recursive: true });

const infile = join(process.cwd(), 'src/tests/fixtures/test_sputnik/resources/index.ts');
const outfile = join(dist, 'index.mjs');

await buildEsm({ infile, outfile });

console.log(`[test_sputnik] ${outfile} generated`);
