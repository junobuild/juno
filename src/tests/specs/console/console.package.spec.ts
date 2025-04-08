import { CONSOLE_WASM_PATH, readWasmVersion } from '../../utils/setup-tests.utils';
import { customSectionJunoPackage } from '../../utils/wasm-tests.utils';

describe('Console > Package', () => {
	it('should expose public custom section juno:package', async () => {
		const junoPkg = await customSectionJunoPackage({ path: CONSOLE_WASM_PATH });

		const expectedPkg = {
			name: '@junobuild/console',
			version: readWasmVersion('console')
		};

		expect(junoPkg).toEqual(expectedPkg);
	});
});
