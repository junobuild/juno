import esbuild from 'esbuild';

// TODO: disallow execution at the root
// TODO: use CLI to build
await esbuild.build({
	entryPoints: ['src/tests/fixtures/test_sputnik/resources/index.ts'],
	outfile: 'src/tests/fixtures/test_sputnik/resources/index.mjs',
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
