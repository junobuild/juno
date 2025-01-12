import type { PostMessage, PostMessageDataRequest } from '$lib/types/post-message';
import { onAuthMessage } from '$lib/workers/auth.worker';
import { onCyclesMessage } from '$lib/workers/cycles.worker';
import { onHostingMessage } from '$lib/workers/hosting.worker';
import { onMonitoringMessage } from '$lib/workers/monitoring.worker';
import { onTokensMessage } from '$lib/workers/tokens.worker';
import { onWalletMessage } from '$lib/workers/wallet.worker';

onmessage = async (msg: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
	await Promise.allSettled([
		onAuthMessage(msg),
		onCyclesMessage(msg),
		onHostingMessage(msg),
		onMonitoringMessage(msg),
		onWalletMessage(msg),
		onTokensMessage(msg)
	]);
};
