<script lang="ts">
	import { debounce } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import Overlays from '$lib/components/core/Overlays.svelte';
	import AuthBroadcastGuard from '$lib/components/guards/AuthBroadcastGuard.svelte';
	import AuthLoader from '$lib/components/loaders/AuthLoader.svelte';
	import AuthWorkerLoader from '$lib/components/loaders/AuthWorkerLoader.svelte';
	import { layoutNavigationTitle } from '$lib/derived/app/layout-navigation.derived';
	import { syncSnapshots } from '$lib/services/ic-mgmt/snapshots.services';
	import { syncSubnets } from '$lib/services/ic-mgmt/subnets.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { authStore, type AuthStoreData } from '$lib/stores/auth.store';
	import '$lib/styles/global.scss';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	/**
	 * App init
	 */

	const init = async () => await Promise.all([i18n.init(), syncSubnets(), syncSnapshots()]);

	onMount(init);

	/**
	 * Navigation title
	 */

	const debounceSetNavTitle = debounce(() => (document.title = $layoutNavigationTitle));

	$effect(() => {
		$layoutNavigationTitle;
		debounceSetNavTitle();
	});

	// Source: https://svelte.dev/blog/view-transitions
	onNavigate((navigation) => {
		if (!document.startViewTransition) {
			return;
		}

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	/**
	 * Boot animation
	 */

	// To improve the UX while the app is loading on mainnet we display a spinner which is attached statically in the index.html files.
	// Once the authentication has been initialized we know most JavaScript resources has been loaded and therefore we can hide the spinner, the loading information.
	const removeLoadingSpinner = ({ authData }: { authData: AuthStoreData }) => {
		// We want to display a spinner until the authentication is loaded. This to avoid a glitch when either the landing page or effective content (sign-in / sign-out) is presented.
		if (authData?.identity === undefined) {
			return;
		}

		const spinner = document.querySelector('body > #app-spinner');
		spinner?.remove();
	};

	$effect(() => {
		removeLoadingSpinner({ authData: $authStore });
	});
</script>

<AuthLoader>
	<AuthWorkerLoader>
		<AuthBroadcastGuard>
			{@render children()}

			<Overlays />
		</AuthBroadcastGuard>
	</AuthWorkerLoader>
</AuthLoader>
