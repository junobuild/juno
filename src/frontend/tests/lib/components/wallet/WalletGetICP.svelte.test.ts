import WalletGetICP from '$lib/components/wallet/WalletGetICP.svelte';
import { render } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockMissionControlId } from '../../../mocks/modules.mock';

describe('WalletGetICP', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.unstubAllEnvs();
	});

	it('should not display button when mode is production', () => {
		vi.stubEnv('MODE', 'production');

		const { getByRole } = render(WalletGetICP, { missionControlId: mockMissionControlId });

		expect(getByRole('button')).not.toBeInTheDocument();
	});

	it('should display button when in dev mode', () => {
		vi.stubEnv('MODE', 'development');

		const { getByRole } = render(WalletGetICP, { missionControlId: mockMissionControlId });

		expect(getByRole('button')).toBeInTheDocument();
	});
});
