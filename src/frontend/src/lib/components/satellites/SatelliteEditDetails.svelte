<script lang="ts">
	import { isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { setSatelliteMetadata } from '$lib/services/mission-control.services';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlDid } from '$lib/types/declarations';
	import type { SatelliteUiTags } from '$lib/types/satellite';
	import { satelliteEnvironment, satelliteName, satelliteTags } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: MissionControlDid.Satellite;
	}

	let { satellite }: Props = $props();

	let satName = $state(satelliteName(satellite));
	let satEnv = $state<string | undefined>(satelliteEnvironment(satellite));

	let satTagsInput = $state(satelliteTags(satellite)?.join(',') ?? '');
	let satTags = $derived<SatelliteUiTags>(
		satTagsInput
			.split(/[\n,]+/)
			.map((input) => input.toLowerCase().trim())
			.filter(notEmptyString)
	);

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

		const { success } = await setSatelliteMetadata({
			missionControlId: $missionControlIdDerived,
			satellite,
			metadata: {
				name: satName,
				environment: satEnv,
				tags: satTags
			}
		});

		if (success) {
			visible = false;
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

			<select id="satelliteEnv" disabled={$isBusy} bind:value={satEnv}>
				<option value={undefined}>{$i18n.core.unspecified}</option>
				<option value="production"> {$i18n.core.production} </option>
				<option value="staging"> {$i18n.core.staging} </option>
				<option value="test"> {$i18n.core.test} </option>
			</select>
		</Value>

		<Value ref="satelliteTags">
			{#snippet label()}
				{$i18n.satellites.tags}
			{/snippet}

			<textarea placeholder={$i18n.satellites.tags_placeholder} rows="5" bind:value={satTagsInput}
			></textarea>
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
