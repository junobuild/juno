import { MISSION_CONTROL_WASM_PATH, readWasmVersion } from '../../utils/setup-tests.utils';
import { customSectionJunoPackage } from '../../utils/wasm-tests.utils';

describe('Mission Control > Package', () => {
	it('should expose public custom section juno:package', async () => {
		const junoPkg = await customSectionJunoPackage({ path: MISSION_CONTROL_WASM_PATH });

		const expectedPkg = {
			name: '@junobuild/mission-control',
			version: readWasmVersion('mission_control')
		};

		expect(junoPkg).toEqual(expectedPkg);
	});
});
