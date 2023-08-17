<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { nonNullish } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { Principal } from '@dfinity/principal';
	import { registerProxy } from '$lib/rest/proxy.rest';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import { satellitesStore } from '$lib/stores/satellite.store';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { setOriginConfig } from '$lib/api/orbiter.api';
	import { createEventDispatcher } from 'svelte';

	export let orbiterId: Principal;
	export let satellites: Satellite[] | undefined;

	let visible: boolean | undefined;

	let filter = '';

	let validConfirm = false;

	const dispatch = createEventDispatcher();

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
			const key = await registerProxy({
				orbiterId: orbiterId.toText(),
				satelliteId: satellite!.satellite_id.toText(),
				filter
			});

			await setOriginConfig({
				orbiterId,
				satelliteId: satellite!.satellite_id,
				config: {
					key: Principal.fromText(key),
					filter,
					updated_at: []
				}
			});

			dispatch('junoReload');

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
	$: satellite = ($satellitesStore ?? []).find(
		({ satellite_id }) => satellite_id.toText() === satelliteIdText
	);

	$: validConfirm = nonNullish(filter) && filter !== '' && nonNullish(satellite);
</script>

<button on:click={() => (visible = true)}>{$i18n.origins.add_a_filter}</button>

<Popover bind:visible center backdrop="dark">
	<form class="container" on:submit|preventDefault={handleSubmit}>
		<label for="satellite">{$i18n.satellites.satellite}:</label>

		<select id="satellite" name="satellite" bind:value={satelliteIdText}>
			{#each satellites as satellite}
				{@const satName = satelliteName(satellite)}

				<option value={satellite.satellite_id.toText()}>{satName}</option>
			{/each}
		</select>

		<label class="origin" for="filter">{$i18n.origins.filter}:</label>

		<input
			id="filter"
			bind:value={filter}
			type="text"
			placeholder={$i18n.origins.edit_filter}
			maxlength={64}
			disabled={$isBusy}
		/>

		<button type="submit" class="submit" disabled={$isBusy || !validConfirm}>
			{$i18n.core.submit}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.edit;

	.origin {
		padding: var(--padding-1_5x) 0 0;
	}
</style>
