<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { authSignedInStore, authStore } from '$lib/stores/auth.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import { canisterStart } from '$lib/api/ic.api';
	import { emit } from '$lib/utils/events.utils';

	export let satellite: Satellite;

	let visible = false;

	const start = async () => {
		if (!$authSignedInStore) {
			toasts.error({
				text: $i18n.errors.no_identity
			});
			return;
		}

		busy.start();

		try {
			await canisterStart({ canisterId: satellite.satellite_id, identity: $authStore.identity! });

			emit({ message: 'junoRestartCycles', detail: { canisterId: satellite.satellite_id } });
			emit({ message: 'junoReloadVersions' });

			close();
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.satellite_start,
				detail: err
			});
		}

		busy.stop();
	};

	const close = () => (visible = false);
</script>

<button on:click={() => (visible = true)}>{$i18n.core.start}</button>

<Confirmation bind:visible on:junoYes={start} on:junoNo={close}>
	<svelte:fragment slot="title">{$i18n.satellites.start_tile}</svelte:fragment>

	<p>{$i18n.satellites.start_info}</p>
</Confirmation>
