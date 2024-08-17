<script lang="ts">
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import type { Principal } from '@dfinity/principal';
	import type { Satellite, Orbiter } from '$declarations/mission_control/mission_control.did';
	import { authSignedInStore, authStore } from '$lib/stores/auth.store';
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
	import { REVOKED_CONTROLLERS } from '$lib/constants/constants';

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
			const actor = await getMissionControlActor({
				missionControlId: $missionControlStore,
				identity: $authStore.identity
			});
			const [sats, orbs] = await Promise.all([actor.list_satellites(), actor.list_orbiters()]);

			satellites = sats;
			orbiters = orbs;

			toggleAll();
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
		if (isNullish(redirect_uri) || isNullish(principal)) {
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

		if (REVOKED_CONTROLLERS.includes(principal)) {
			toasts.error({
				text: 'The controller intended for sign-in purposes has been revoked. Please update your Juno CLI!'
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
								scope: 'admin',
								identity: $authStore.identity
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

<p class="add">
	{$i18n.cli.add}
</p>

<form on:submit|preventDefault={onSubmit}>
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th class="tools"> {$i18n.cli.selected} </th>
					<th> {$i18n.cli.module} </th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="actions"><input type="checkbox" bind:checked={missionControl} /></td>

					<td>
						<span>{$i18n.mission_control.title}</span>
						<span class="canister-id">({$missionControlStore?.toText() ?? ''})</span>
					</td>
				</tr>

				{#each satellites as satellite}
					<tr>
						<td class="actions"
							><input type="checkbox" bind:group={selectedSatellites} value={satellite} /></td
						>
						<td
							><span>{satelliteName(satellite[1])}</span>
							<span class="canister-id">({satellite[0].toText()})</span></td
						>
					</tr>
				{/each}

				{#each orbiters as orbiter}
					{@const orbName = orbiterName(orbiter[1])}

					<tr>
						<td class="actions"
							><input type="checkbox" bind:group={selectedOrbiters} value={orbiter} /></td
						>
						<td>
							<span>{!orbName ? 'Analytics' : orbName}</span>
							<span class="canister-id">({orbiter[0].toText()})</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="objects">
		<div class="checkbox all">
			<input type="checkbox" on:change={toggleAll} checked={allSelected} />
			<span>{allSelected ? $i18n.cli.unselect_all : $i18n.cli.select_all}</span>
		</div>
	</div>

	<div class="card-container with-title">
		<span class="title">{$i18n.cli.terminal}</span>

		<div class="content">
			<p>
				{@html i18nFormat($i18n.cli.controller, [
					{
						placeholder: '{0}',
						value: principal
					}
				])}
			</p>

			<p class="profile-hint">
				<label for="profile">
					{$i18n.cli.profile}
				</label>
			</p>

			<input
				id="profile"
				type="text"
				placeholder={$i18n.cli.profile_placeholder}
				name="profile"
				bind:value={profile}
			/>
		</div>
	</div>

	<button {disabled}>{$i18n.cli.authorize}</button>
</form>

<style lang="scss">
	@use '../../../lib/styles/mixins/text';
	@use '../../../lib/styles/mixins/media';

	.tools {
		width: 88px;
	}

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
		margin: 0 0 var(--padding-2x);
		padding: var(--padding) var(--padding-2x);
	}

	.add {
		padding: 0 0 var(--padding-2x);
		margin: 0;
	}

	.table-container {
		margin: 0;
	}

	.card-container {
		margin: var(--padding-4x) 0 var(--padding-6x);
	}

	.actions {
		display: flex;
		padding: var(--padding-2x) var(--padding-2x);
	}

	input[type='checkbox'] {
		margin: 0;
	}

	.profile-hint {
		margin: 0;
	}
</style>
