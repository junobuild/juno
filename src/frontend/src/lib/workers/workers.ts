import type { PostMessageRequest } from '$lib/types/post-message';
import { onAuthMessage } from '$lib/workers/auth.worker';
import { onCyclesMessage } from '$lib/workers/cycles.worker';
import { onExchangeMessage } from '$lib/workers/exchange.worker';
import { onHostingMessage } from '$lib/workers/hosting.worker';
import { onMonitoringMessage } from '$lib/workers/monitoring.worker';
import { onRegistryMessage } from '$lib/workers/registry.worker';
import { onWalletMessage } from '$lib/workers/wallet.worker';

onmessage = async (msg: MessageEvent<PostMessageRequest>) => {
	await Promise.allSettled([
		onAuthMessage(msg),
		onCyclesMessage(msg),
		onHostingMessage(msg),
		onMonitoringMessage(msg),
		onWalletMessage(msg),
		onExchangeMessage(msg),
		onRegistryMessage(msg)
	]);
};
