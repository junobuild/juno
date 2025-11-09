import { readWasmVersion, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';
import { customSectionJunoPackage } from '../../../utils/wasm-tests.utils';

describe('Satellite > Package', () => {
	it('should expose public custom section juno:package', async () => {
		const junoPkg = await customSectionJunoPackage({ path: SATELLITE_WASM_PATH });

		const expectedPkg = {
			name: '@junobuild/satellite',
			version: readWasmVersion('satellite')
		};

		expect(junoPkg).toEqual(expectedPkg);
	});
});
