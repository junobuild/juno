<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { setSatelliteMetadata } from '$lib/services/mission-control.services';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { satelliteEnvironment, satelliteName } from '$lib/utils/satellite.utils';
	import Value from '$lib/components/ui/Value.svelte';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satName = $state(satelliteName(satellite));
	let satEnv = $state<string | undefined>(satelliteEnvironment(satellite));

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
			await setSatelliteMetadata({
				missionControlId: $missionControlIdDerived,
				satellite,
				satelliteName: satName,
				satelliteEnv: satEnv
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

<button class="menu" onclick={open}><IconEdit /> {$i18n.satellites.edit_details}</button>

<Popover backdrop="dark" center bind:visible>
	<form class="container" onsubmit={handleSubmit}>
		<Value ref="satelliteName">
			{#snippet label()}
				{$i18n.satellites.satellite_name}
			{/snippet}

			<input
				id="satelliteName"
				autocomplete="off"
				data-1p-ignore
				disabled={$isBusy}
				maxlength={64}
				placeholder={$i18n.satellites.edit_details}
				type="text"
				bind:value={satName}
			/>
		</Value>

		<Value ref="satelliteEnv">
			{#snippet label()}
				{$i18n.satellites.environment}
			{/snippet}

			<select id="satelliteEnv" bind:value={satEnv}>
				<option value={undefined}>{$i18n.core.unspecified}</option>
				<option value="production"> {$i18n.core.production} </option>
				<option value="staging"> {$i18n.core.staging} </option>
				<option value="test"> {$i18n.core.test} </option>
			</select>
		</Value>

		<button class="submit" disabled={$isBusy || !validConfirm} type="submit">
			{$i18n.core.apply}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.edit;
</style>
