import { canisterStatus, canisterUpdateSettings } from '$lib/api/ic.api';
import { setControllers } from '$lib/api/satellites.api';
import {
	emulatorObservatoryMonitoringOpenId,
	getEmulatorMainIdentity
} from '$lib/rest/emulator.rest';
import {
	emulatorToggleOpenIdMonitoring,
	unsafeSetEmulatorControllerForSatellite
} from '$lib/services/emulator.services';
import { toasts } from '$lib/stores/app/toasts.store';
import type { CanisterInfo } from '$lib/types/canister';
import { Principal } from '@icp-sdk/core/principal';
import { satelliteVersion } from '@junobuild/admin';
import i18Mock from '../../mocks/i18n.mock';
import { mockIdentity } from '../../mocks/identity.mock';

vi.mock('$lib/api/satellites.api');
vi.mock('$lib/rest/emulator.rest');
vi.mock('@junobuild/admin');
vi.mock('$lib/api/ic.api');

describe('emulator.services', () => {
	const mockSatelliteId = Principal.fromText('jx5yt-yyaaa-aaaal-abzbq-cai');
	const mockPrincipalText = 'xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe';

	beforeEach(() => {
		vi.clearAllMocks();
		vi.unstubAllEnvs();

		vi.mocked(getEmulatorMainIdentity).mockResolvedValue(mockPrincipalText);
		vi.mocked(emulatorObservatoryMonitoringOpenId);
		vi.mocked(satelliteVersion).mockResolvedValue('0.1.0');

		vi.mocked(canisterStatus).mockResolvedValue({
			settings: {
				controllers: [Principal.fromText(mockPrincipalText)]
			}
		} as CanisterInfo);
		vi.mocked(canisterUpdateSettings).mockResolvedValue(undefined);
	});

	describe('unsafeSetEmulatorControllerForSatellite', () => {
		it('should throw an error when mode is production', async () => {
			vi.stubEnv('MODE', 'production');

			await expect(
				unsafeSetEmulatorControllerForSatellite({
					satelliteId: mockSatelliteId,
					identity: mockIdentity
				})
			).rejects.toThrow(i18Mock.emulator.error_never_execute_set_controller);

			expect(setControllers).not.toHaveBeenCalled();
			expect(getEmulatorMainIdentity).not.toHaveBeenCalled();
		});

		it('should set controller when in skylab mode', async () => {
			vi.stubEnv('MODE', 'skylab');

			await unsafeSetEmulatorControllerForSatellite({
				satelliteId: mockSatelliteId,
				identity: mockIdentity
			});

			expect(getEmulatorMainIdentity).toHaveBeenCalled();
			expect(setControllers).toHaveBeenCalledWith({
				args: {
					controller: {
						expires_at: [],
						metadata: [['profile', '👾 Emulator']],
						scope: {
							Admin: null
						}
					},
					controllers: [Principal.fromText(mockPrincipalText)]
				},
				satelliteId: mockSatelliteId,
				identity: mockIdentity
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
