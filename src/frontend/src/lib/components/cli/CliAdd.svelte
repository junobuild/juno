<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { Satellite, Orbiter } from '$declarations/mission_control/mission_control.did';
	import { setOrbitersController } from '$lib/api/mission-control.api';
	import SegmentsTable from '$lib/components/segments/SegmentsTable.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { REVOKED_CONTROLLERS } from '$lib/constants/app.constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import {
		setMissionControlControllerForVersion,
		setSatellitesControllerForVersion
	} from '$lib/services/mission-control.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { bigintStringify } from '$lib/utils/number.utils';
	import { orbiterName } from '$lib/utils/orbiter.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		principal: string;
		redirect_uri: string;
		missionControlId: MissionControlId;
	}

	let { principal, redirect_uri, missionControlId }: Props = $props();

	let profile = $state('');

	let selectedMissionControl = $state(false);
	let selectedSatellites: [Principal, Satellite][] = $state([]);
	let selectedOrbiters: [Principal, Orbiter][] = $state([]);

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isNullish(redirect_uri) || isNullish(principal)) {
			toasts.error({
				text: $i18n.errors.cli_missing_params
			});
			return;
		}

		if (isNullish($missionControlIdDerived)) {
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
				...(selectedMissionControl
					? [
							setMissionControlControllerForVersion({
								missionControlId: $missionControlIdDerived,
								controllerId: principal,
								profile,
								scope: 'admin'
							})
						]
					: []),
				...(selectedSatellites.length > 0
					? [
							setSatellitesControllerForVersion({
								missionControlId: $missionControlIdDerived,
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
								missionControlId: $missionControlIdDerived,
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
				selectedMissionControl ? `mission_control=${$missionControlIdDerived.toText()}` : undefined,
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

	let disabled = $state(true);

	let loadingSegments = $state<'loading' | 'ready' | 'error'>('loading');
</script>

<form onsubmit={onSubmit}>
	<p class="add">
		{$i18n.cli.add}
	</p>

	<SegmentsTable
		{missionControlId}
		bind:selectedMissionControl
		bind:selectedSatellites
		bind:selectedOrbiters
		bind:selectedDisabled={disabled}
		bind:loadingSegments
	>
		<div class="terminal">{$i18n.cli.terminal}:&nbsp;{principal}</div>
	</SegmentsTable>

	{#if loadingSegments === 'ready'}
		<div class="options">
			<Collapsible>
				<svelte:fragment slot="header">{$i18n.core.advanced_options}</svelte:fragment>

				<div>
					<p class="profile-info">{$i18n.cli.profile_info}</p>

					<input
						id="profile"
						type="text"
						placeholder={$i18n.cli.profile_placeholder}
						name="profile"
						bind:value={profile}
						autocomplete="off"
						data-1p-ignore
					/>
				</div>
			</Collapsible>
		</div>

		<div in:fade>
			<Warning>
				<Html text={$i18n.cli.confirm} />
			</Warning>

			<button {disabled}>{$i18n.cli.authorize}</button>
		</div>
	{/if}
</form>

<style lang="scss">
	form {
		padding: 0 0 var(--padding-8x);
	}

	button {
		margin: var(--padding-2_5x) 0 0;
		display: block;
	}

	.add {
		padding: 0 0 var(--padding-2x);
		margin: 0;
	}

	.terminal {
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-bold);
		background: var(--color-card-contrast);
		color: var(--color-card);
		padding: var(--padding-0_5x) var(--padding-2x);
	}

	.options {
		margin: var(--padding-4x) 0 var(--padding-6x);
	}

	.profile-info {
		margin: 0;
	}
</style>
