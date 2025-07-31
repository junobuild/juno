<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import {
		satelliteCustomDomain,
		satelliteCustomDomainsLoaded
	} from '$lib/derived/satellite-custom-domains.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteUrl } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let defaultUrl = $derived(satelliteUrl(satellite.satellite_id.toText()));

	let href = $derived(
		nonNullish($satelliteCustomDomain) ? `https://${$satelliteCustomDomain}` : defaultUrl
	);

	let host = $derived($satelliteCustomDomain ?? $i18n.hosting.default_url);
</script>

{#if $satelliteCustomDomainsLoaded && nonNullish(host)}
	<a class="button" {href} rel="noreferrer noopener" target="_blank" in:fade>Visit</a>
{/if}
