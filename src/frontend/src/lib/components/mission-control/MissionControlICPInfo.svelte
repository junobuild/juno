<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { nonNullish } from '@dfinity/utils';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';

	interface Props {
		accountIdentifier: AccountIdentifier | undefined;
	}

	let { accountIdentifier }: Props = $props();
</script>

{#if nonNullish($missionControlStore) && nonNullish(accountIdentifier)}
	<p>
		{$i18n.wallet.transfer_to_account_identifier}
		<strong><Identifier identifier={accountIdentifier.toHex()} /></strong>.
	</p>
{/if}

<p>
	{$i18n.wallet.transfer_icp_info}
	<ExternalLink underline href="https://juno.build/docs/pricing#sending-icp-to-your-mission-control"
		>documentation</ExternalLink
	>.
</p>

<button onclick={bubble('click')}>{$i18n.core.close}</button>
