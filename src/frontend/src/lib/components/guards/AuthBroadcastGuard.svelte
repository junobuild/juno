<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { authNotSignedIn, authSignedIn } from '$lib/derived/auth.derived';
	import { AuthBroadcastChannel } from '$lib/providers/auth-broadcast.provider';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const handleBroadcastLoginSuccess = async () => {
		const wasPreviouslyAuthenticated = $authSignedIn;

		await authStore.forceSync();

		if ($authNotSignedIn) {
			return;
		}

		if (!wasPreviouslyAuthenticated) {
			toasts.show({ text: $i18n.authentication.refreshed_authentication, level: 'info' });
		}

		// TODO: add a warning banner for the hedge case in which the tab was already logged in and now is refreshed with another identity
	};

	const openBc = () => {
		try {
			const bc = AuthBroadcastChannel.getInstance();

			bc.onLoginSuccess(handleBroadcastLoginSuccess);

			return () => {
				bc?.destroy();
			};
		} catch (err: unknown) {
			// We don't really care if the broadcast channel fails to open or if it fails to set the message handler.
			// This is a non-critical feature that improves the UX when Juno is open in multiple tabs.
			// We just print a warning in the console for debugging purposes.
			console.warn('Auth BroadcastChannel initialization failed', err);
		}
	};

	onMount(openBc);
</script>

{@render children()}
