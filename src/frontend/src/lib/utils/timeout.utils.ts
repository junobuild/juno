export const waitForMilliseconds = (milliseconds: number): Promise<void> =>
	new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});

export const waitReady = async ({
	// 30 tries with a delay of 500ms each = max 15 seconds
	retries = 30,
	isDisabled,
	intervalInMs = 500
}: {
	retries?: number;
	isDisabled: () => boolean;
	intervalInMs?: number;
}): Promise<'ready' | 'timeout'> => {
	const disabled = isDisabled();

	if (!disabled) {
		return 'ready';
	}

	const remainingRetries = retries - 1;

	if (remainingRetries === 0) {
		return 'timeout';
	}

	await waitForMilliseconds(intervalInMs);

	return waitReady({ retries: remainingRetries, isDisabled });
};
