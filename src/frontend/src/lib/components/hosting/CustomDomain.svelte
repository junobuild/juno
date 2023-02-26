<script lang="ts">
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import CustomDomainActions from '$lib/components/hosting/CustomDomainActions.svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { CustomDomain as CustomDomainType } from '$declarations/satellite/satellite.did';
	import { CustomDomain } from '$declarations/satellite/satellite.did';
	import type { HostingCallback } from '$lib/services/worker.hosting.services';
	import { onDestroy, onMount } from 'svelte';
	import { PostMessageDataResponse } from '$lib/types/post-message';
	import { initHostingWorker } from '$lib/services/worker.hosting.services';

	export let url: string;
	export let ariaLabel = '';
	export let type: 'default' | 'custom' = 'default';
	export let customDomain: [string, CustomDomainType] | undefined = undefined;
	export let satellite: Satellite | undefined = undefined;
	export let toolsColumn = true;

	let host = '';
	$: ({ host } = new URL(url));

	let registrationState: CustomDomainRegistrationState | null | undefined = undefined;

	let worker:
		| {
				startCustomDomainRegistrationTimer: (params: {
					customDomain: CustomDomain;
					callback: HostingCallback;
				}) => void;
				stopCustomDomainRegistrationTimer: () => void;
		  }
		| undefined;

	const syncState = ({ registrationState: state }: PostMessageDataResponse) =>
		(registrationState = state);

	const loadRegistrationState = async () => {
		if (isNullish(customDomain)) {
			registrationState = null;
			worker?.stopCustomDomainRegistrationTimer();
			return;
		}

		worker?.startCustomDomainRegistrationTimer({
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
			: $i18n.hosting[registrationState.toLowerCase()];
</script>

{#if toolsColumn}
	<td>
		{#if type === 'custom' && nonNullish(satellite)}
			<CustomDomainActions {satellite} {customDomain} {displayState} />
		{/if}
	</td>
{/if}

<td colspan={type === 'default' ? 2 : undefined}>
	<div class="domain">
		<ExternalLink href={url} {ariaLabel}>{host}</ExternalLink>
		<span class="type">{type}</span>
	</div>
</td>

{#if type === 'custom'}
	<td class="state"
		><span
			>{#if nonNullish(displayState)}
				{displayState}
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
			padding: 0 var(--padding-1_5x);

			@include media.min-width(medium) {
				padding: 0;
			}
		}
	}

	td {
		vertical-align: middle;
	}
</style>
