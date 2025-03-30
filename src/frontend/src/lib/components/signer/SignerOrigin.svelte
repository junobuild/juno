<script lang="ts">
	import type { Origin, PayloadOrigin } from '@dfinity/oisy-wallet-signer';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Option } from '$lib/types/utils';

	interface Props {
		payload: Option<PayloadOrigin>;
	}

	let { payload }: Props = $props();

	let origin = $derived(payload?.origin);

	const mapHost = (origin: Origin | undefined): Option<string> => {
		if (isNullish(origin)) {
			return undefined;
		}

		try {
			// If set we are actually sure that the $payload.origin is a valid URL, thanks to the library but, for the state of the art, we still catch potential errors here too.
			const { host } = new URL(origin);
			return host;
		} catch {
			return null;
		}
	};

	// Null being used if mapping the origin does not work - i.e. invalid origin. Probably an edge case.

	let host = $derived(mapHost(origin));
</script>

{#if nonNullish(origin)}
	<p>
		{$i18n.signer.origin_request_from}
		{#if nonNullish(host)}<span
				><ExternalLink ariaLabel={$i18n.signer.origin_link_to_dapp} href={origin}
					>{host}</ExternalLink
				></span
			>{:else}<span>{$i18n.signer.origin_invalid_origin}</span>{/if}
	</p>
{/if}
