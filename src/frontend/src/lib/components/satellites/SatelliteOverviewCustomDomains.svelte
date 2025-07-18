<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		satelliteCustomDomainsLoaded,
		sortedSatelliteCustomDomains
	} from '$lib/derived/satellite-custom-domains.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteUrl } from '$lib/utils/satellite.utils';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let defaultUrl = $derived(satelliteUrl(satellite.satellite_id.toText()));

	let urls = $derived<{ href: string; host: string }[]>([
		...$sortedSatelliteCustomDomains.map(([customDomain, _]) => ({
			href: `https://${customDomain}`,
			host: customDomain
		})),
		...($sortedSatelliteCustomDomains.length === 0
			? [{ href: defaultUrl, host: URL.parse(defaultUrl)?.host ?? $i18n.hosting.default_url }]
			: [])
	]);
</script>

<div>
	<Value>
		{#snippet label()}
			{$i18n.hosting.title}
		{/snippet}
		{#if $satelliteCustomDomainsLoaded}
			<div in:fade>
				{#each urls as { href, host }, index (index)}
					<ExternalLink {href}><span class="host">{host}</span></ExternalLink>
				{/each}
			</div>
		{:else}
			<SkeletonText />
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
