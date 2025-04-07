import {
	MISSION_CONTROL_WASM_PATH,
	OBSERVATORY_WASM_PATH,
	ORBITER_WASM_PATH,
	readWasmVersion
} from '../../utils/setup-tests.utils';
import { customSectionJunoPackage } from '../../utils/wasm-tests.utils';

describe('Orbiter > Package', () => {
	it('should expose public custom section juno:package', async () => {
		const junoPkg = await customSectionJunoPackage({ path: ORBITER_WASM_PATH });

		const expectedPkg = {
			name: '@junobuild/orbiter',
			version: readWasmVersion('orbiter')
		};

		expect(junoPkg).toEqual(expectedPkg);
	});
});
