<script lang="ts">
	import { isNullish, notEmptyString } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import { fade } from 'svelte/transition';
	import type { MissionControlDid } from '$declarations';
	import SegmentsTable from '$lib/components/segments/SegmentsTable.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { REVOKED_CONTROLLERS } from '$lib/constants/app.constants';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { setCliControllers } from '$lib/services/cli.services';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import type { Satellite } from '$lib/types/satellite';
	import type { Option } from '$lib/types/utils';

	interface Props {
		missionControlId: Option<MissionControlId>;
		principal: string;
		redirect_uri: string;
		profile: Option<string>;
	}

	let { missionControlId, principal, redirect_uri, profile }: Props = $props();

	let selectedMissionControl = $state(false);
	let selectedSatellites = $state<[Principal, Satellite][]>([]);
	let selectedOrbiters = $state<[Principal, MissionControlDid.Orbiter][]>([]);

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isNullish(redirect_uri) || isNullish(principal)) {
			toasts.error({
				text: $i18n.errors.cli_missing_params
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

		if (isNullish($authIdentity)) {
			toasts.error({
				text: $i18n.authentication.not_signed_in
			});
			return;
		}

		busy.start();

		const result = await setCliControllers({
			selectedMissionControl,
			missionControlId,
			controllerId: principal,
			profile,
			identity: $authIdentity,
			selectedSatellites,
			selectedOrbiters
		});

		busy.stop();

		if (result.success === 'error') {
			toasts.error({
				text: $i18n.errors.cli_unexpected_error,
				detail: result.err
			});
			return;
		}

		const { redirectQueryParams } = result;

		// Redirect when everything is set.
		window.location.href = `${redirect_uri}${redirectQueryParams.length > 0 ? '&' : ''}${redirectQueryParams.join(
			'&'
		)}`;
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
		<div class="terminal">
			{$i18n.cli.terminal}:&nbsp;{principal}{#if notEmptyString(profile)}&nbsp;[{profile}]{/if}
		</div>
	</SegmentsTable>

	{#if loadingSegments === 'ready'}
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
</style>
