<script lang="ts">
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { getCustomDomainRegistration } from '$lib/services/hosting.services';
	import { i18n } from '$lib/stores/i18n.store';
	import CustomDomainActions from '$lib/components/hosting/CustomDomainActions.svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { CustomDomain as CustomDomainType } from '$declarations/satellite/satellite.did';

	export let url: string;
	export let ariaLabel = '';
	export let type: 'default' | 'custom' = 'default';
	export let customDomain: [string, CustomDomainType] | undefined = undefined;
	export let satellite: Satellite;

	let host = '';
	$: ({ host } = new URL(url));

	let registrationState: CustomDomainRegistrationState | undefined = undefined;

	const loadRegistrationState = async () => {
		if (isNullish(customDomain)) {
			registrationState = undefined;
			return;
		}

		try {
			const registration = await getCustomDomainRegistration(customDomain[1]);
			registrationState = registration?.state;
		} catch (err: unknown) {
			registrationState = 'Failed';

			// Error is display with state, we do not use a toast here
			console.error(err);
		}
	};

	$: customDomain, (async () => await loadRegistrationState())();

	let displayState: string | undefined;
	$: displayState = nonNullish(registrationState)
		? $i18n.hosting[registrationState.toLowerCase()]
		: undefined;
</script>

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
		>

		{#if type === 'custom'}
			<CustomDomainActions {satellite} {customDomain} {displayState} />
		{/if}</td
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
