<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import { busy } from '$lib/stores/busy.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { canisterStop } from '$lib/api/ic.api';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
    import {authSignedInStore, authStore} from "$lib/stores/auth.store";

	export let satellite: Satellite;

	let visible = false;

	const stop = async () => {
        if (!$authSignedInStore) {
            toasts.error({
                text: $i18n.errors.no_identity,
            });
            return;
        }

		busy.start();

		try {
			await canisterStop({ canisterId: satellite.satellite_id, identity: $authStore.identity! });
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.satellite_stop,
				detail: err
			});
		}

		busy.stop;
	};

	const close = () => (visible = false);
</script>

<button on:click={() => (visible = true)}>{$i18n.canisters.stop}</button>

<Confirmation bind:visible on:junoYes={stop} on:junoNo={close}>
	<svelte:fragment slot="title">{$i18n.canisters.stop_title}</svelte:fragment>

	<p>{$i18n.canisters.stop_info}</p>

	<p>{$i18n.canisters.stop_explanation}</p>
</Confirmation>
