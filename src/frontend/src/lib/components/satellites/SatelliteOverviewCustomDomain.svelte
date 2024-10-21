<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		satelliteCustomDomain,
		satelliteCustomDomainsLoaded
	} from '$lib/derived/custom-domains.derived';
	import { listCustomDomains } from '$lib/services/hosting.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteUrl } from '$lib/utils/satellite.utils';

	export let satellite: Satellite;

	onMount(async () => {
		await listCustomDomains({
			satelliteId: satellite.satellite_id,
			reload: false
		});
	});

	let defaultUrl: string;
	$: defaultUrl = satelliteUrl(satellite.satellite_id.toText());

	let href: string;
	$: href = nonNullish($satelliteCustomDomain) ? `https://${$satelliteCustomDomain}` : defaultUrl;

	let host: string;
	$: host = $satelliteCustomDomain ?? new URL(defaultUrl).host;
</script>

<div>
	<Value>
		<svelte:fragment slot="label">{$i18n.hosting.title}</svelte:fragment>
		{#if $satelliteCustomDomainsLoaded}
			<ExternalLink {href} ariaLabel={$i18n.hosting.custom_domain}
				><span class="host">{host}</span></ExternalLink
			>
		{:else}
			<span>&ZeroWidthSpace;</span>
		{/if}
	</Value>
</div>

<style lang="scss">
	@use '../../styles/mixins/text';

	div {
		:global(a) {
			min-width: 100%;
		}
	}

	.host {
		max-width: 65%;
		@include text.truncate;
	}
</style>
