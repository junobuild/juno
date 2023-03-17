<script lang="ts">
	import { authSignedInStore, authStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { getMissionControlActor } from '$lib/utils/actor.utils';
	import { bigintStringify } from '$lib/utils/number.utils';
	import {
		addMissionControlController,
		addSatellitesController,
		setMissionControlController,
		setSatellitesController
	} from '$lib/api/mission-control.api';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import type { Principal } from '@dfinity/principal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import {
		type Tab,
		TABS_CONTEXT_KEY,
		type TabsContext,
		type TabsStore
	} from '$lib/types/tabs.context';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { ChangeEventHandler } from 'svelte/elements';

	export let data: {
		redirect_uri: string | null | undefined;
		principal: string | null | undefined;
	};

	let redirect_uri: string | null | undefined;
	let principal: string | null | undefined;
	$: ({ redirect_uri, principal } = data);

	const signIn = async () => await authStore.signIn(undefined);

	let satellites: [Principal, Satellite][] = [];

	const loadSatellites = async () => {
		if (!$authSignedInStore) {
			satellites = [];
			return;
		}

		if (isNullish($missionControlStore)) {
			satellites = [];
			return;
		}

		try {
			const actor = await getMissionControlActor($missionControlStore);
			satellites = await actor.list_satellites();
		} catch (err: unknown) {
			console.error(err);
		}
	};

	$: $authSignedInStore, $missionControlStore, (async () => await loadSatellites())();

	let selectedSatellites: [Principal, Satellite][] = [];
	let missionControl = false;

	let allSelected = false;

	const toggleAll = () => {
		allSelected = !allSelected;

		missionControl = allSelected;
		selectedSatellites = allSelected ? [...satellites] : [];
	};

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

		// TODO: to be removed in next version as only supported if < v0.0.3
		const missionControlController =
			$versionStore?.missionControl?.current === '0.0.3'
				? setMissionControlController
				: addMissionControlController;

		// TODO: to be removed in next version as only supported if < v0.0.6
		const satellitesController =
			$versionStore?.satellite?.current === '0.0.7'
				? setSatellitesController
				: addSatellitesController;

		try {
			await Promise.all([
				...(missionControl
					? [
							missionControlController({
								missionControlId: $missionControlStore,
								controllerId: principal,
								controllerName: ''
							})
					  ]
					: []),
				...(selectedSatellites.length > 0
					? [
							satellitesController({
								missionControlId: $missionControlStore,
								controllerId: principal,
								satelliteIds: selectedSatellites.map((s) => s[0]),
								controllerName: ''
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
				missionControl ? `mission_control=${$missionControlStore.toText()}` : undefined
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
	$: disabled = selectedSatellites.length === 0 && !missionControl;

	const tabs: Tab[] = [
		{
			id: Symbol('1'),
			labelKey: 'cli.title'
		}
	];

	const store = writable<TabsStore>({
		tabId: tabs[0].id,
		tabs
	});

	setContext<TabsContext>(TABS_CONTEXT_KEY, {
		store
	});
</script>

<Tabs help="https://juno.build/docs/miscellaneous/cli">
	<div class="card-container">
		{#if redirect_uri && principal}
			{#if $authSignedInStore}
				<p>
					{@html i18nFormat($i18n.cli.add, [
						{
							placeholder: '{0}',
							value: principal
						}
					])}
				</p>

				<form on:submit|preventDefault={onSubmit}>
					<div class="checkbox">
						<input type="checkbox" bind:checked={missionControl} />
						<span>{$i18n.mission_control.title} ({$missionControlStore?.toText() ?? ''})</span>
					</div>

					{#each satellites as satellite}
						<div class="checkbox">
							<input type="checkbox" bind:group={selectedSatellites} value={satellite} /><span
								>{satelliteName(satellite[1])} ({satellite[0].toText()})</span
							>
						</div>
					{/each}

					<div class="checkbox all">
						<input type="checkbox" on:change={toggleAll} />
						<span>{allSelected ? $i18n.cli.unselect_all : $i18n.cli.select_all}</span>
					</div>

					<button {disabled}>{$i18n.core.submit}</button>
				</form>
			{:else}
				<p>
					{@html i18nFormat($i18n.cli.sign_in, [
						{
							placeholder: '{0}',
							value: principal
						}
					])}
				</p>

				<button on:click={signIn}>{$i18n.core.sign_in}</button>
			{/if}
		{:else}
			<p>{$i18n.errors.cli_missing_params}</p>
		{/if}
	</div>
</Tabs>

<style lang="scss">
	@use '../../../lib/styles/mixins/text';

	.checkbox {
		display: flex;
		gap: var(--padding-2x);
	}

	span {
		@include text.truncate;
	}

	button {
		margin: var(--padding-2x) 0 0;
	}

	.all {
		margin: var(--padding-0_5x) 0 var(--padding-2x);
		align-items: center;
		font-size: var(--font-size-small);
	}
</style>
