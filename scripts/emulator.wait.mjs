const DEFAULT_TIMEOUT_IN_MILLISECONDS = 2 * 60 * 1000;
const RETRY_IN_MILLISECONDS = 500;

const waitEmulatorReady = async ({ count }) => {
	const ready = await isEmulatorReady();

	if (ready) {
		return 'ready';
	}

	const nextCount = count - 1;

	if (nextCount === 0) {
		return 'timeout';
	}

	await new Promise((resolve) => setTimeout(resolve, RETRY_IN_MILLISECONDS));

	return await waitEmulatorReady({ count: nextCount });
};

const isEmulatorReady = async () => {
	try {
		const { result } = await dispatchRequest({
			request: 'health'
		});

		return result === 'ok';
	} catch (_e) {
		return false;
	}
};

const dispatchRequest = async ({ request, timeout = 5000 }) => {
	const adminPort = 5999;

	try {
		const response = await fetch(`http://localhost:${adminPort}/${request}`, {
			signal: AbortSignal.timeout(timeout)
		});

		if (!response.ok) {
			return { result: 'not_ok', response };
		}

		return { result: 'ok', response };
	} catch (err) {
		return { result: 'error', err };
	}
};

console.log('Waiting for emulator...');

const status = await waitEmulatorReady({
	count: DEFAULT_TIMEOUT_IN_MILLISECONDS / RETRY_IN_MILLISECONDS
});

if (status === 'timeout') {
	console.error('❌ The emulator is not ready. Operation timed out.');
	process.exit(1);
}

console.log('Emulator is ready. ✅');
