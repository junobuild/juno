<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		satelliteCustomDomain,
		satelliteCustomDomainsLoaded
	} from '$lib/derived/satellite-custom-domains.derived';
	import { listCustomDomains } from '$lib/services/custom-domain.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteUrl } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	onMount(async () => {
		await listCustomDomains({
			satelliteId: satellite.satellite_id,
			reload: false
		});
	});

	let defaultUrl = $derived(satelliteUrl(satellite.satellite_id.toText()));

	let href = $derived(
		nonNullish($satelliteCustomDomain) ? `https://${$satelliteCustomDomain}` : defaultUrl
	);

	let host = $derived($satelliteCustomDomain ?? $i18n.hosting.default_url);
</script>

<div>
	<Value>
		{#snippet label()}
			{$i18n.hosting.title}
		{/snippet}
		{#if $satelliteCustomDomainsLoaded && nonNullish(host)}
			<span in:fade
				><ExternalLink {href} ariaLabel={$i18n.hosting.custom_domain}
					><span class="host">{host}</span></ExternalLink
				></span
			>
		{:else}
			<span>&ZeroWidthSpace;</span>
		{/if}
	</Value>
</div>

<style lang="scss">
	@use '../../styles/mixins/text';

	div {
		margin: 0 0 var(--padding-2_5x);

		:global(a) {
			width: 100%;
			max-width: 100%;
		}
	}

	.host {
		@include text.truncate;
	}
</style>
