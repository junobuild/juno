<script lang="ts">
	import type { ResultConsentInfo } from '@dfinity/oisy-wallet-signer';
	import { nonNullish } from '@dfinity/utils';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		consentInfo: ResultConsentInfo | undefined;
	}

	let { consentInfo }: Props = $props();

	// The ICRC-49 standard specifies that a user should be warned when a consent message is interpreted on the frontend side instead of being retrieved through a canister.
	// See https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_49_call_canister.md#message-processing
	let displayWarning = $derived(nonNullish(consentInfo) && 'Warn' in consentInfo);
</script>

{#if displayWarning}
	<Warning>$i18n.signer.consent_message.warning.token_without_consent_message</Warning>
{/if}
