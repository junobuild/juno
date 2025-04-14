import { setSatellitesController } from '$lib/api/mission-control.api';
import { getEmulatorMainIdentity } from '$lib/rest/emulator.rest';
import { unsafeSetEmulatorControllerForSatellite } from '$lib/services/emulator.services';
import { Principal } from '@dfinity/principal';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18Mock from '../../mocks/i18n.mock';
import { mockIdentity } from '../../mocks/identity.mock';
import {mockMissionControlId} from "../../mocks/modules.mock";

vi.mock('$lib/api/mission-control.api');
vi.mock('$lib/rest/emulator.rest');

describe('emulator.services', () => {
	const mockSatelliteId = Principal.fromText('jx5yt-yyaaa-aaaal-abzbq-cai');
	const mockPrincipalText = 'xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe';

	beforeEach(() => {
		vi.clearAllMocks();
		vi.unstubAllEnvs();

		vi.mocked(getEmulatorMainIdentity).mockResolvedValue(mockPrincipalText);
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
			).rejects.toThrow(i18Mock.emulator.error_never_execute);

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
});
