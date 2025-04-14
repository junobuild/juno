import WalletGetICP from '$lib/components/wallet/WalletGetICP.svelte';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { mockMissionControlId } from '../../../mocks/modules.mock';

describe('WalletGetICP', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.unstubAllEnvs();
	});

	it('should not display button when mode is not dev', () => {
		vi.stubEnv('DEV', false);

		const { container } = render(WalletGetICP, { missionControlId: mockMissionControlId });

		expect(container.querySelector('button')).not.toBeInTheDocument();
	});

	it('should display button when in skylab mode', () => {
		vi.stubEnv('DEV', false);
		vi.stubEnv('MODE', 'skylab');

		const { getByRole } = render(WalletGetICP, { missionControlId: mockMissionControlId });

		expect(getByRole('button')).toBeInTheDocument();
	});

	it('should display button when in dev mode', () => {
		vi.stubEnv('DEV', true);

		const { getByRole } = render(WalletGetICP, { missionControlId: mockMissionControlId });

		expect(getByRole('button')).toBeInTheDocument();
	});
});
