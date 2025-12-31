import WalletGetToken from '$lib/components/wallet/WalletGetToken.svelte';
import { render } from '@testing-library/svelte';

import { testIds } from '$lib/constants/test-ids.constants';
import { mockSelectedWallet } from '../../../mocks/modules.mock';

describe('WalletGetToken', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.unstubAllEnvs();
	});

	it('should not display button when mode is not dev', () => {
		vi.stubEnv('DEV', false);

		const { container } = render(WalletGetToken, { selectedWallet: mockSelectedWallet });

		expect(container.querySelector('button')).not.toBeInTheDocument();
	});

	describe.each([testIds.navbar.getIcp, testIds.navbar.getCycles])('With %s', (testId) => {
		it('should display button when in skylab mode', () => {
			vi.stubEnv('DEV', false);
			vi.stubEnv('MODE', 'skylab');

			const { getByTestId } = render(WalletGetToken, { selectedWallet: mockSelectedWallet });

			expect(getByTestId(testId)).toBeInTheDocument();
		});

		it('should display button when in dev mode', () => {
			vi.stubEnv('DEV', true);

			const { getByTestId } = render(WalletGetToken, { selectedWallet: mockSelectedWallet });

			expect(getByTestId(testId)).toBeInTheDocument();
		});
	});
});
