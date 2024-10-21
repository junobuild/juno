<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Overlays from '$lib/components/core/Overlays.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { displayAndCleanLogoutMsg, signOut } from '$lib/services/auth.services';
	import { initMissionControl } from '$lib/services/console.services';
	import { initAuthWorker } from '$lib/services/worker.auth.services';
	import { type AuthStoreData, authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';

	const init = async () => await Promise.all([i18n.init(), syncAuthStore()]);

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

	const initUser = async ({ identity }: AuthStoreData) => {
		if (isNullish(identity)) {
			return;
		}

		try {
			// Poll to init mission control center
			await initMissionControl({
				identity,
				// eslint-disable-next-line require-await
				onInitMissionControlSuccess: async (missionControlId) =>
					missionControlStore.set(missionControlId)
			});
		} catch (err: unknown) {
			toasts.error({
				text: `Error initializing the user.`,
				detail: err
			});

			// There was an error so, we sign the user out otherwise skeleton and other spinners will be displayed forever
			await signOut();
		}
	};

	$: (async () => await initUser($authStore))();

	let worker: { syncAuthIdle: (auth: AuthStoreData) => void } | undefined;

	onMount(async () => (worker = await initAuthWorker()));

	$: worker, $authStore, (() => worker?.syncAuthIdle($authStore))();
</script>

<svelte:window on:storage={syncAuthStore} />

{#await init()}
	<Spinner />
{:then _}
	<slot />

	<Overlays />
{/await}

<style lang="scss" global>
	@import '../lib/styles/global.scss';
</style>
