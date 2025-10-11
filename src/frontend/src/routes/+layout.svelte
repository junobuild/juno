<script lang="ts">
	import { debounce } from '@dfinity/utils';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import { onNavigate } from '$app/navigation';
	import Overlays from '$lib/components/core/Overlays.svelte';
	import { layoutNavigationTitle } from '$lib/derived/layout-navigation.derived';
	import { displayAndCleanLogoutMsg } from '$lib/services/auth/auth.services';
	import { initMissionControl } from '$lib/services/console.services';
	import { syncSnapshots } from '$lib/services/snapshots.services';
	import { syncSubnets } from '$lib/services/subnets.services';
	import { AuthWorker } from '$lib/services/workers/worker.auth.services';
	import { authStore, type AuthStoreData } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
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
	 * App sync
	 */

	const syncAuthStore = async () => {
		if (!browser) {
			return;
		}

		try {
			await authStore.sync();
		} catch (err: unknown) {
			console.error(err);
		}

		displayAndCleanLogoutMsg();
	};

	const sync = async () => {
		await syncAuthStore();
	};

	$effect(() => {
		initMissionControl($authStore);
	});

	/**
	 * Auth worker
	 */

	let worker = $state<AuthWorker | undefined>();

	onMount(async () => (worker = await AuthWorker.init()));
	onDestroy(() => worker?.terminate());

	$effect(() => {
		worker;
		$authStore;

		worker?.syncAuthIdle($authStore);
	});

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

<svelte:window onstorage={syncAuthStore} />

{#await sync()}
	<!-- No animation as initializing the auth should be fast -->
{:then _}
	{@render children()}

	<Overlays />
{/await}
