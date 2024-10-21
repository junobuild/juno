<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { setSatelliteName } from '$lib/services/mission-control.services';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { satelliteName } from '$lib/utils/satellite.utils';

	export let satellite: Satellite;

	let satName = satelliteName(satellite);

	let visible: boolean | undefined;

	let validConfirm = false;
	let saving = false;

	$: validConfirm = nonNullish(satName) && satName !== '';

	const handleSubmit = async () => {
		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.satellite_name_missing
			});
			return;
		}

		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		busy.start();

		try {
			await setSatelliteName({
				missionControlId: $missionControlStore,
				satellite,
				satelliteName: satName
			});

			visible = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.satellite_name_update,
				detail: err
			});
		}

		busy.stop();
	};
</script>

<Value>
	<svelte:fragment slot="label">{$i18n.satellites.name}</svelte:fragment>
	<p class="name">
		<span>{satelliteName(satellite)}</span>

		<button
			on:click|stopPropagation={() => (visible = true)}
			aria-label={$i18n.satellites.edit_name}
			title={$i18n.satellites.edit_name}
			class="square"
		>
			<IconEdit />
		</button>
	</p>
</Value>

<Popover bind:visible center backdrop="dark">
	<form class="container" on:submit|preventDefault={handleSubmit}>
		<label for="canisterName">{$i18n.satellites.satellite_name}:</label>

		<input
			id="canisterName"
			bind:value={satName}
			type="text"
			placeholder={$i18n.satellites.edit_name}
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
	@use '../../styles/mixins/text';

	@include dialog.edit;

	.name {
		max-width: 70%;

		span {
			@include text.truncate;
		}
	}
</style>
