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

{#if $satelliteCustomDomainsLoaded && nonNullish(host)}
	<a class="button" {href} target="_blank" rel="noreferrer noopener" in:fade>Visit</a>
{/if}
