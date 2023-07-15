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

	export let satellite: Satellite;

	let satelliteId: SatelliteIdText;
	$: satelliteId = satellite.satellite_id.toText();

	let canisterName = satelliteName(satellite);

	let visible: boolean | undefined;
	let saving = false;

	const handleSubmit = async ($event: MouseEvent | TouchEvent) => {
		$event.preventDefault();

		busy.start();

		try {
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
			bind:value={canisterName}
			type="text"
			placeholder="A shortname for hint"
			maxlength={64}
			disabled={saving}
		/>

		<button type="submit" class="submit" disabled={saving}> {$i18n.core.submit} </button>
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
