import { setSatellitesController } from '$lib/api/mission-control.api';
import {
	emulatorObservatoryMonitoringOpenId,
	getEmulatorMainIdentity
} from '$lib/rest/emulator.rest';
import {
	emulatorToggleOpenIdMonitoring,
	unsafeSetEmulatorControllerForSatellite
} from '$lib/services/emulator.services';
import { Principal } from '@icp-sdk/core/principal';

import { toasts } from '$lib/stores/app/toasts.store';
import i18Mock from '../../mocks/i18n.mock';
import { mockIdentity } from '../../mocks/identity.mock';
import { mockMissionControlId } from '../../mocks/modules.mock';

vi.mock('$lib/api/mission-control.api');
vi.mock('$lib/rest/emulator.rest');

describe('emulator.services', () => {
	const mockSatelliteId = Principal.fromText('jx5yt-yyaaa-aaaal-abzbq-cai');
	const mockPrincipalText = 'xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe';

	beforeEach(() => {
		vi.clearAllMocks();
		vi.unstubAllEnvs();

		vi.mocked(getEmulatorMainIdentity).mockResolvedValue(mockPrincipalText);
		vi.mocked(emulatorObservatoryMonitoringOpenId);
	});

	describe('unsafeSetEmulatorControllerForSatellite', () => {
		it('should throw an error when mode is production', async () => {
			vi.stubEnv('MODE', 'production');

			await expect(
				unsafeSetEmulatorControllerForSatellite({
					missionControlId: mockMissionControlId,
					satelliteId: mockSatelliteId,
					identity: mockIdentity
				})
			).rejects.toThrow(i18Mock.emulator.error_never_execute_set_controller);

			expect(setSatellitesController).not.toHaveBeenCalled();
			expect(getEmulatorMainIdentity).not.toHaveBeenCalled();
		});

		it('should set controller when in skylab mode', async () => {
			vi.stubEnv('MODE', 'skylab');

			await unsafeSetEmulatorControllerForSatellite({
				missionControlId: mockMissionControlId,
				satelliteId: mockSatelliteId,
				identity: mockIdentity
			});

			expect(getEmulatorMainIdentity).toHaveBeenCalled();
			expect(setSatellitesController).toHaveBeenCalledWith({
				missionControlId: mockMissionControlId,
				satelliteIds: [mockSatelliteId],
				identity: mockIdentity,
				controllerId: mockPrincipalText,
				profile: '👾 Emulator',
				scope: 'admin'
			});
		});
	});

	describe('emulatorToggleOpenIdMonitoring', () => {
		it('should throw an error when mode is production', async () => {
			vi.stubEnv('MODE', 'production');

			await expect(emulatorToggleOpenIdMonitoring({ enable: true })).rejects.toThrow(
				i18Mock.emulator.error_never_execute_openid_monitoring
			);
		});

		it('should start observatory monitoring openid when in skylab mode', async () => {
			vi.stubEnv('MODE', 'skylab');

			await emulatorToggleOpenIdMonitoring({
				enable: true
			});

			expect(emulatorObservatoryMonitoringOpenId).toHaveBeenCalledWith({ action: 'start' });
		});

		it('should stop observatory monitoring openid when in skylab mode', async () => {
			vi.stubEnv('MODE', 'skylab');

			await emulatorToggleOpenIdMonitoring({
				enable: false
			});

			expect(emulatorObservatoryMonitoringOpenId).toHaveBeenCalledWith({ action: 'stop' });
		});

		it('should toasts an error in skylab mode if admin server cannot be reached', async () => {
			vi.stubEnv('MODE', 'skylab');

			const mockErr = new Error('test');

			vi.mocked(emulatorObservatoryMonitoringOpenId).mockImplementation(() => {
				throw mockErr;
			});

			const spy = vi.spyOn(toasts, 'error').mockImplementation(vi.fn());

			await emulatorToggleOpenIdMonitoring({
				enable: true
			});

			expect(spy).toHaveBeenCalledWith({
				detail: mockErr,
				text: i18Mock.emulator.error_toggling_openid_monitoring_failed
			});
		});
	});
});
