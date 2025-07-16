import { OBSERVATORY_WASM_PATH, readWasmVersion } from '../../utils/setup-tests.utils';
import { customSectionJunoPackage } from '../../utils/wasm-tests.utils';

describe('Observatory > Package', () => {
	it('should expose public custom section juno:package', async () => {
		const junoPkg = await customSectionJunoPackage({ path: OBSERVATORY_WASM_PATH });

		const expectedPkg = {
			name: '@junobuild/observatory',
			version: readWasmVersion('observatory')
		};

		expect(junoPkg).toEqual(expectedPkg);
	});
});
