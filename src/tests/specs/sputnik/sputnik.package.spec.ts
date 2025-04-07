import { readWasmVersion, TEST_SPUTNIK_WASM_PATH } from '../../utils/setup-tests.utils';
import { customSectionJunoPackage } from '../../utils/wasm-tests.utils';

describe('Sputnik > Package', () => {
	it('should expose public custom section juno:package', async () => {
		const junoPkg = await customSectionJunoPackage({ path: TEST_SPUTNIK_WASM_PATH });

		const expectedPkg = {
			name: 'test-sputnik',
			version: '1.2.3-patch.4',
			dependencies: {
				'@junobuild/satellite': readWasmVersion('satellite'),
				'@junobuild/sputnik': readWasmVersion('sputnik')
			}
		};

		expect(junoPkg).toEqual(expectedPkg);
	});
});
