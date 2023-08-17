<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { nonNullish } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import type { Principal } from '@dfinity/principal';
	import { registerProxy } from '$lib/rest/proxy.rest';
	import type {SatelliteIdText} from "$lib/types/satellite";
	import {satellitesStore} from "$lib/stores/satellite.store";
	import {satelliteName} from "$lib/utils/satellite.utils";
	import type {Satellite} from "$declarations/mission_control/mission_control.did";

	export let orbiterId: Principal;

	let visible: boolean | undefined;

	let origin = '';

	let validConfirm = false;
	let saving = false;

	const handleSubmit = async () => {
		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.origin_filter_missing
			});
			return;
		}

		busy.start();

		try {
			await registerProxy({
				orbiterId: orbiterId.toText(),
				origins: ['juno.build']
			});

			visible = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.origin_filter_unexpected,
				detail: err
			});
		}

		busy.stop();
	};

	let satelliteIdText: SatelliteIdText;

	let satellite: Satellite | undefined;
	$: satellite = ($satellitesStore ?? [])[satelliteIdText];

	$: validConfirm = nonNullish(origin) && origin !== '' && nonNullish(satellite);
</script>

<button on:click={() => (visible = true)}>{$i18n.origins.add_a_filter}</button>

<Popover bind:visible center backdrop="dark">
	<form class="container" on:submit|preventDefault={handleSubmit}>
		<label for="satellite">{$i18n.satellites.satellite}:</label>

		<select id="satellite" name="satellite" bind:value={satelliteIdText}>
			{#each ($satellitesStore ?? []) as satellite}
				{@const satName = satelliteName(satellite)}

				<option value={satellite.satellite_id.toText()}>{satName}</option>
			{/each}
		</select>

		<label class="origin" for="origin">{$i18n.origins.filter}:</label>

		<input
			id="origin"
			bind:value={origin}
			type="text"
			placeholder={$i18n.origins.edit_filter}
			maxlength={64}
			disabled={saving}
		/>

		<button type="submit" class="submit" disabled={saving || !validConfirm}>
			{$i18n.core.submit}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.edit;

	button {
		margin: var(--padding) 0 var(--padding-8x);
	}

	.origin {
		padding: var(--padding-1_5x) 0 0;
	}
</style>
