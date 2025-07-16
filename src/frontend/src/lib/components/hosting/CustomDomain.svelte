<script lang="ts">
	import { isNullish, nonNullish, fromNullishNullable } from '@dfinity/utils';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { run } from 'svelte/legacy';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type {
		AuthenticationConfig,
		CustomDomain as CustomDomainType
	} from '$declarations/satellite/satellite.did';
	import CustomDomainActions from '$lib/components/hosting/CustomDomainActions.svelte';
	import IconCheckCircle from '$lib/components/icons/IconCheckCircle.svelte';
	import IconSync from '$lib/components/icons/IconSync.svelte';
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import {
		type HostingCallback,
		HostingWorker
	} from '$lib/services/workers/worker.hosting.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
	import type { PostMessageDataResponseHosting } from '$lib/types/post-message';
	import type { Option } from '$lib/types/utils';
	import { emit } from '$lib/utils/events.utils';
	import { keyOf } from '$lib/utils/utils';

	interface Props {
		url: string;
		ariaLabel?: string;
		type?: 'default' | 'custom';
		customDomain?: [string, CustomDomainType] | undefined;
		satellite?: Satellite | undefined;
		config?: AuthenticationConfig | undefined;
	}

	let {
		url,
		ariaLabel = '',
		type = 'default',
		customDomain = undefined,
		satellite = undefined,
		config = undefined
	}: Props = $props();

	let host = $state('');
	run(() => {
		({ host } = new URL(url));
	});

	let authDomain: string | undefined = $derived(
		fromNullishNullable(fromNullishNullable(config?.internet_identity)?.derivation_origin)
	);

	let mainDomain: boolean = $derived(host === authDomain && nonNullish(authDomain));

	let registrationState: Option<CustomDomainRegistrationState> = $state(undefined);

	let worker = $state<HostingWorker | undefined>();

	const syncState = ({ registrationState: state }: PostMessageDataResponseHosting) => {
		registrationState = state;

		// If the state is available we can optimistically stop polling
		if (registrationState === 'Available') {
			worker?.stopCustomDomainRegistrationTimer();
		}

		emit({ message: 'junoRegistrationState', detail: { registrationState } });
	};

	const loadRegistrationState = () => {
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

	onMount(async () => (worker = await HostingWorker.init()));
	onDestroy(() => worker?.stopCustomDomainRegistrationTimer());

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		(worker, customDomain, loadRegistrationState());
	});

	let displayState: Option<string> = $derived(
		registrationState === undefined
			? undefined
			: registrationState === null
				? null
				: keyOf({ obj: $i18n.hosting, key: (registrationState as string).toLowerCase() })
	);

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
			<ButtonTableAction icon="info" ariaLabel={$i18n.hosting.info} onaction={displayInfo} />

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
	<td
		><span class="state"
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
		@include text.truncate;

		padding: 0 var(--padding-1_5x);

		@include media.min-width(medium) {
			padding: 0;
		}

		:global(svg) {
			vertical-align: middle;
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
