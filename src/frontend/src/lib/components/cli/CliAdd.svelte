<script lang="ts">
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import type { Principal } from '@dfinity/principal';
	import type { Satellite, Orbiter } from '$declarations/mission_control/mission_control.did';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getMissionControlActor } from '$lib/utils/actor.juno.utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import {
		setMissionControlControllerForVersion,
		setSatellitesForVersion
	} from '$lib/services/mission-control.services';
	import { bigintStringify } from '$lib/utils/number.utils';
	import { orbiterName } from '$lib/utils/orbiter.utils';
	import { setOrbitersController } from '$lib/api/mission-control.api';

	export let principal: string;
	export let redirect_uri: string;

	let satellites: [Principal, Satellite][] = [];
	let orbiters: [Principal, Orbiter][] = [];

	const loadSegments = async () => {
		if (!$authSignedInStore) {
			satellites = [];
			orbiters = [];
			return;
		}

		if (isNullish($missionControlStore)) {
			satellites = [];
			orbiters = [];
			return;
		}

		try {
			const actor = await getMissionControlActor($missionControlStore);
			const [sats, orbs] = await Promise.all([actor.list_satellites(), actor.list_orbiters()]);

			satellites = sats;
			orbiters = orbs;
		} catch (err: unknown) {
			console.error(err);
		}
	};

	$: $authSignedInStore, $missionControlStore, (async () => await loadSegments())();

	let selectedSatellites: [Principal, Satellite][] = [];
	let selectedOrbiters: [Principal, Orbiter][] = [];
	let missionControl = false;

	let allSelected = false;

	const toggleAll = () => {
		allSelected = !allSelected;

		missionControl = allSelected;
		selectedSatellites = allSelected ? [...satellites] : [];
		selectedOrbiters = allSelected ? [...orbiters] : [];
	};

	let profile = '';

	const onSubmit = async () => {
		if (!redirect_uri || !principal) {
			toasts.error({
				text: $i18n.errors.cli_missing_params
			});
			return;
		}

		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		if (disabled) {
			toasts.error({
				text: $i18n.errors.cli_missing_selection
			});
			return;
		}

		busy.start();

		try {
			await Promise.all([
				...(missionControl
					? [
							setMissionControlControllerForVersion({
								missionControlId: $missionControlStore,
								controllerId: principal,
								profile,
								scope: 'admin'
							})
					  ]
					: []),
				...(selectedSatellites.length > 0
					? [
							setSatellitesForVersion({
								missionControlId: $missionControlStore,
								controllerId: principal,
								satelliteIds: selectedSatellites.map((s) => s[0]),
								profile,
								scope: 'admin'
							})
					  ]
					: []),
				...(selectedOrbiters.length > 0
					? [
							setOrbitersController({
								missionControlId: $missionControlStore,
								controllerId: principal,
								orbiterIds: selectedOrbiters.map((s) => s[0]),
								profile,
								scope: 'admin'
							})
					  ]
					: [])
			]);

			const parameters = [
				selectedSatellites.length > 0
					? `satellites=${encodeURIComponent(
							JSON.stringify(
								selectedSatellites.map(([p, n]) => ({
									p: p.toText(),
									n: satelliteName(n)
								})),
								bigintStringify
							)
					  )}`
					: undefined,
				selectedOrbiters.length > 0
					? `orbiters=${encodeURIComponent(
							JSON.stringify(
								selectedOrbiters.map(([p, n]) => ({
									p: p.toText(),
									n: orbiterName(n)
								})),
								bigintStringify
							)
					  )}`
					: undefined,
				missionControl ? `mission_control=${$missionControlStore.toText()}` : undefined,
				profile !== '' ? `profile=${profile}` : undefined
			].filter((param) => nonNullish(param));

			// Redirect when everything is set.
			window.location.href = `${redirect_uri}${parameters.length > 0 ? '&' : ''}${parameters.join(
				'&'
			)}`;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.cli_unexpected_error,
				detail: err
			});
		}

		busy.stop();
	};

	let disabled = true;
	$: disabled = selectedSatellites.length === 0 && !missionControl && selectedOrbiters.length === 0;
</script>

<p>
	{@html i18nFormat($i18n.cli.add, [
		{
			placeholder: '{0}',
			value: principal
		}
	])}
</p>

<form on:submit|preventDefault={onSubmit}>
	<div class="objects">
		<div class="checkbox">
			<input type="checkbox" bind:checked={missionControl} />
			<span>{$i18n.mission_control.title}</span>
			<span class="canister-id">({$missionControlStore?.toText() ?? ''})</span>
		</div>

		{#each satellites as satellite}
			<div class="checkbox">
				<input type="checkbox" bind:group={selectedSatellites} value={satellite} /><span
					>{satelliteName(satellite[1])}</span
				>
				<span class="canister-id">({satellite[0].toText()})</span>
			</div>
		{/each}

		{#each orbiters as orbiter}
			{@const orbName = orbiterName(orbiter[1])}

			<div class="checkbox">
				<input type="checkbox" bind:group={selectedOrbiters} value={orbiter} /><span
					>{!orbName ? 'Analytics' : orbName}</span
				>
				<span class="canister-id">({orbiter[0].toText()})</span>
			</div>
		{/each}

		<div class="checkbox all">
			<input type="checkbox" on:change={toggleAll} />
			<span>{allSelected ? $i18n.cli.unselect_all : $i18n.cli.select_all}</span>
		</div>
	</div>

	<label for="profile">
		{$i18n.cli.profile}
	</label>

	<input
		id="profile"
		type="text"
		placeholder={$i18n.cli.profile_placeholder}
		name="profile"
		class="profile"
		bind:value={profile}
	/>

	<button {disabled}>{$i18n.core.submit}</button>
</form>

<style lang="scss">
	@use '../../../lib/styles/mixins/text';
	@use '../../../lib/styles/mixins/media';

	.checkbox {
		display: flex;
		align-items: center;
		gap: var(--padding-2x);
	}

	span {
		@include text.truncate;
	}

	button {
		margin: var(--padding-2_5x) 0 0;
		display: block;
	}

	.canister-id {
		font-size: var(--font-size-ultra-small);
	}

	.all {
		margin: var(--padding) 0 0;
		align-items: center;
		font-size: var(--font-size-ultra-small);

		span {
			padding: 0 0 var(--padding-0_5x);
		}
	}

	.objects {
		margin: var(--padding-2x) 0;
		padding: var(--padding);
	}

	.profile {
		@include media.min-width(large) {
			max-width: 50%;
		}
	}
</style>
