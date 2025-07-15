<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { setSatelliteName } from '$lib/services/mission-control.services';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satName = $state(satelliteName(satellite));

	let visible: boolean = $state(false);

	let validConfirm = $derived(nonNullish(satName) && satName !== '');

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.satellite_name_missing
			});
			return;
		}

		if (isNullish($missionControlIdDerived)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		busy.start();

		try {
			await setSatelliteName({
				missionControlId: $missionControlIdDerived,
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

	const open = ($event: MouseEvent | TouchEvent) => {
		$event.stopPropagation();

		visible = true;
	};
</script>

<button class="menu" onclick={open}><IconEdit /> {$i18n.satellites.edit_name}</button>

<Popover bind:visible center backdrop="dark">
	<form class="container" onsubmit={handleSubmit}>
		<label for="canisterName">{$i18n.satellites.satellite_name}:</label>

		<input
			id="canisterName"
			bind:value={satName}
			type="text"
			placeholder={$i18n.satellites.edit_name}
			maxlength={64}
			disabled={$isBusy}
			autocomplete="off"
			data-1p-ignore
		/>

		<button type="submit" class="submit" disabled={$isBusy || !validConfirm}>
			{$i18n.core.apply}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';
	@use '../../styles/mixins/text';

	@include dialog.edit;
</style>
