import SignInActions from '$lib/components/sign-in/SignInActions.svelte';
import { render } from '@testing-library/svelte';

import { testIds } from '$lib/constants/test-ids.constants';

describe('SignInActions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.unstubAllEnvs();
	});

	it('should display dev sign-in when mode is dev', () => {
		vi.stubEnv('DEV', true);

		const { getByTestId } = render(SignInActions);

		expect(getByTestId(testIds.auth.signInDev)).toBeInTheDocument();
	});

	it('should display dev sign-in when mode is skylab', () => {
		vi.stubEnv('DEV', false);
		vi.stubEnv('MODE', 'skylab');

		const { getByTestId } = render(SignInActions);

		expect(getByTestId(testIds.auth.signInDev)).toBeInTheDocument();
	});

	describe.each(['Continue with Identity', 'Continue with Google', 'Continue with GitHub'])(
		'%s',
		(text) => {
			it('should not display button when mode is skylab', () => {
				vi.stubEnv('DEV', false);
				vi.stubEnv('MODE', 'skylab');

				const { queryByText } = render(SignInActions);

				expect(queryByText(text)).not.toBeInTheDocument();
			});

			it('should display button when in prod', () => {
				vi.stubEnv('PROD', true);

				const { getByText } = render(SignInActions);

				expect(getByText(text)).toBeInTheDocument();
			});
		}
	);
});
