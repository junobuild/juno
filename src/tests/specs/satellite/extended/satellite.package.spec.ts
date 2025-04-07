import { readWasmVersion, TEST_SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';
import { customSectionJunoPackage } from '../../../utils/wasm-tests.utils';

describe('Satellite > Extended > Package', () => {
	it('should expose public custom section juno:package', async () => {
		const junoPkg = await customSectionJunoPackage({ path: TEST_SATELLITE_WASM_PATH });

		const expectedPkg = {
			name: 'test-satellite',
			version: readWasmVersion('tests/fixtures/test_satellite'),
			dependencies: {
				'@junobuild/satellite': readWasmVersion("satellite")
			}
		};

		expect(junoPkg).toEqual(expectedPkg);
	});
});
