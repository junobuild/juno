<script lang="ts">
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { keyOf } from '$lib/utils/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import CustomDomainActions from '$lib/components/hosting/CustomDomainActions.svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type {
		AuthenticationConfig,
		CustomDomain as CustomDomainType
	} from '$declarations/satellite/satellite.did';
	import type { HostingCallback } from '$lib/services/worker.hosting.services';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import type { PostMessageDataResponse } from '$lib/types/post-message';
	import { initHostingWorker } from '$lib/services/worker.hosting.services';
	import IconSync from '$lib/components/icons/IconSync.svelte';
	import IconCheckCircle from '$lib/components/icons/IconCheckCircle.svelte';
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import { emit } from '$lib/utils/events.utils';

	export let url: string;
	export let ariaLabel = '';
	export let type: 'default' | 'custom' = 'default';
	export let customDomain: [string, CustomDomainType] | undefined = undefined;
	export let satellite: Satellite | undefined = undefined;
	export let config: AuthenticationConfig | undefined = undefined;

	let host = '';
	$: ({ host } = new URL(url));

	let authDomain: string | undefined;
	$: authDomain = fromNullable(
		fromNullable(config?.internet_identity ?? [])?.derivation_origin ?? []
	);

	let mainDomain: boolean;
	$: mainDomain = host === authDomain && nonNullish(authDomain);

	let registrationState: CustomDomainRegistrationState | null | undefined = undefined;

	let worker:
		| {
				startCustomDomainRegistrationTimer: (params: {
					customDomain: CustomDomainType;
					callback: HostingCallback;
				}) => void;
				stopCustomDomainRegistrationTimer: () => void;
		  }
		| undefined;

	const syncState = ({ registrationState: state }: PostMessageDataResponse) => {
		registrationState = state;

		// If the state is available we can optimistically stop polling
		if (registrationState === 'Available') {
			worker?.stopCustomDomainRegistrationTimer();
		}

		emit({ message: 'junoRegistrationState', detail: { registrationState } });
	};

	const loadRegistrationState = async () => {
		if (isNullish(worker)) {
			registrationState = undefined;
			return;
		}

		if (isNullish(customDomain)) {
			registrationState = null;
			worker?.stopCustomDomainRegistrationTimer();
			return;
		}

		worker.startCustomDomainRegistrationTimer({
			customDomain: customDomain[1],
			callback: syncState
		});
	};

	onMount(async () => (worker = await initHostingWorker()));
	onDestroy(() => worker?.stopCustomDomainRegistrationTimer());

	$: worker, customDomain, (async () => await loadRegistrationState())();

	let displayState: string | undefined | null;
	$: displayState =
		registrationState === undefined
			? undefined
			: registrationState === null
				? null
				: keyOf({ obj: $i18n.hosting, key: registrationState.toLowerCase() });

	const dispatch = createEventDispatcher();
	const displayInfo = () =>
		dispatch('junoDisplayInfo', {
			customDomain,
			registrationState,
			mainDomain
		});
</script>

<td>
	{#if type === 'custom' && nonNullish(satellite)}
		<div class="actions">
			<ButtonTableAction icon="info" ariaLabel={$i18n.hosting.info} on:click={displayInfo} />

			<CustomDomainActions {satellite} {customDomain} {config} {displayState} />
		</div>
	{/if}
</td>

<td colspan={type === 'default' ? 2 : undefined}>
	<div class="domain">
		<ExternalLink href={url} {ariaLabel}>{host}</ExternalLink>
		<span class="type">{type}</span>
	</div>
</td>

{#if type === 'custom'}
	<td class="auth">
		{#if mainDomain}
			<IconCheckCircle />
		{/if}</td
	>
	<td class="state"
		><span
			>{#if nonNullish(displayState)}
				{displayState}
				{#if ['PendingOrder', 'PendingChallengeResponse', 'PendingAcmeApproval'].includes(registrationState ?? '')}
					<IconSync />
				{/if}
			{/if}</span
		></td
	>
{/if}

<style lang="scss">
	@use '../../styles/mixins/fonts';
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/media';

	.domain {
		display: flex;
		flex-direction: column;

		:global(*) {
			@include text.truncate;
			display: inline-block;
			vertical-align: middle;
		}

		:global(svg) {
			margin-left: 0;
		}
	}

	.type {
		@include fonts.small;
		color: var(--color-primary);
	}

	.state {
		display: flex;
		flex-direction: column;

		@include media.min-width(medium) {
			flex-direction: row;
			justify-content: space-between;
		}

		span {
			@include text.truncate;

			padding: 0 var(--padding-1_5x);

			@include media.min-width(medium) {
				padding: 0;
			}

			:global(svg) {
				vertical-align: middle;
			}
		}
	}

	td {
		vertical-align: middle;
	}

	.auth {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}

	.actions {
		display: inline-flex;
		gap: var(--padding);
	}
</style>
