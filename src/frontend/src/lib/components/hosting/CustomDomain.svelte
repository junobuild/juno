<script lang="ts">
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import type { CustomDomain } from '$declarations/satellite/satellite.did';
	import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { getCustomDomainRegistration } from '$lib/services/hosting.services';

	export let url: string;
	export let ariaLabel = '';
	export let type: 'default' | 'custom' = 'default';
	export let customDomain: CustomDomain | undefined = undefined;

	let host = '';
	$: ({ host } = new URL(url));

	let registrationState: CustomDomainRegistrationState | undefined = undefined;

	const loadRegistrationState = async () => {
		if (isNullish(customDomain)) {
			registrationState = undefined;
			return;
		}

		try {
			const registration = await getCustomDomainRegistration(customDomain);
			registrationState = registration?.state;
		} catch (err: unknown) {
			registrationState = 'Failed';

			// Error is display with state, we do not use a toast here
			console.error(err);
		}
	};

	$: customDomain, (async () => await loadRegistrationState())();
</script>

<td colspan={nonNullish(registrationState) ? 2 : undefined} class="domain">
	<ExternalLink href={url} {ariaLabel}>{host}</ExternalLink>
	<span>{type}</span>
</td>

{#if nonNullish(registrationState)}
	<td>{registrationState}</td>
{/if}

<style lang="scss">
	@use '../../styles/mixins/fonts';
	@use '../../styles/mixins/text';

	.domain {
		display: flex;
		flex-direction: column;

		:global(*) {
			@include text.truncate;
			display: inline-block;
		}
	}

	span {
		@include fonts.small;
		color: var(--color-primary);
	}
</style>
