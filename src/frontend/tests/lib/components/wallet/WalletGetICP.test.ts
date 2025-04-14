import WalletGetICP from '$lib/components/wallet/WalletGetICP.svelte';
import { render } from '@testing-library/svelte';
import { mockMissionControlId } from '../../../mocks/modules.mock';

describe('WalletGetICP', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.unstubAllEnvs();
	});

	it.only('should not display button when mode is production', () => {
		vi.stubEnv('MODE', 'production');

		const { container } = render(WalletGetICP, { missionControlId: mockMissionControlId });

		expect(container.querySelector('button')).not.toBeInTheDocument();
	});

	it('should display button when in dev mode', () => {
		vi.stubEnv('MODE', 'development');

		const { getByRole } = render(WalletGetICP, { missionControlId: mockMissionControlId });

		expect(getByRole('button')).toBeInTheDocument();
	});
});
