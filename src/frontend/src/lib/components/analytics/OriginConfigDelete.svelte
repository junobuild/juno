<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import type { Principal } from '@dfinity/principal';
	import type { OriginConfig } from '$declarations/orbiter/orbiter.did';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import { createEventDispatcher } from 'svelte';
	import { deleteOriginConfig } from '$lib/api/orbiter.api';
	import { toNullable } from '$lib/utils/did.utils';

	export let orbiterId: Principal;
	export let satelliteId: Principal;
	export let config: OriginConfig;

	let visible = false;

	const close = () => (visible = false);

	const dispatch = createEventDispatcher();

	const deleteController = async () => {
		busy.start();

		try {
			await deleteOriginConfig({
				orbiterId,
				satelliteId,
				config: {
					updated_at: toNullable(config.updated_at)
				}
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.origin_delete,
				detail: err
			});
		}

		close();

		dispatch('junoReload');

		busy.stop();
	};
</script>

<ButtonTableAction
	icon="delete"
	ariaLabel={$i18n.origins.delete}
	on:click={() => (visible = true)}
/>

<Confirmation bind:visible on:junoYes={deleteController} on:junoNo={close}>
	<svelte:fragment slot="title">{$i18n.origins.delete}</svelte:fragment>

	<Value>
		<svelte:fragment slot="label">{$i18n.satellites.satellite}</svelte:fragment>
		<p>TODO</p>
	</Value>
</Confirmation>
