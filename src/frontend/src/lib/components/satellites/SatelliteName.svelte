<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { setSatelliteName } from '$lib/services/mission-control.services';

	export let satellite: Satellite;

	let satelliteId: SatelliteIdText;
	$: satelliteId = satellite.satellite_id.toText();

	let satName = satelliteName(satellite);

	let visible: boolean | undefined;

	let validConfirm = false;
	let saving = false;

	$: validConfirm = nonNullish(satName) && satName !== '';

	const handleSubmit = async ($event: MouseEvent | TouchEvent) => {
		$event.preventDefault();

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
	<p>
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
	<form class="container" on:submit={async ($event) => await handleSubmit($event)}>
		<label for="canisterName">{$i18n.satellites.satellite_name}:</label>

		<input
			id="canisterName"
			bind:value={satName}
			type="text"
			placeholder="A shortname for hint"
			maxlength={64}
			disabled={saving}
		/>

		<button type="submit" class="submit" disabled={saving || !validConfirm}>
			{$i18n.core.submit}
		</button>
	</form>
</Popover>

<style lang="scss">
	p {
		display: inline-flex;
		align-items: center;
		gap: var(--padding-2x);
		max-width: 100%;
	}

	.container {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: var(--padding) var(--padding-2x) var(--padding) var(--padding);
		margin: 0;
	}

	label {
		display: block;
		margin: 0;
		font-weight: var(--font-weight-bold);
	}

	.submit {
		margin: var(--padding-1_5x) 0 var(--padding);
	}
</style>
