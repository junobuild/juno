import esbuild from 'esbuild';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'target', 'fixtures');

if (existsSync(dist)) {
	rmSync(dist, { recursive: true, force: true });
}

mkdirSync(dist, { recursive: true });

const outfile = join(dist, 'index.mjs');

// TODO: disallow execution at the root
// TODO: use CLI to build
await esbuild.build({
	entryPoints: [join(process.cwd(), 'src/tests/fixtures/test_sputnik/resources/index.ts')],
	outfile,
	bundle: true,
	minify: true,
	treeShaking: true,
	format: 'esm',
	platform: 'browser',
	write: true,
	supported: {
		'top-level-await': false,
		'inline-script': false,
		'dynamic-import': false
	},
	define: {
		self: 'globalThis'
	}
});

console.log(`[test_sputnik] ${outfile} generated`);
