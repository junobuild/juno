<script lang="ts">
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { nonNullish } from '$lib/utils/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import type { AccountIdentifier } from '@junobuild/ledger';

	export let accountIdentifier: AccountIdentifier | undefined;
</script>

{#if nonNullish($missionControlStore) && nonNullish(accountIdentifier)}
	<p>
		{$i18n.mission_control.transfer_to_account_identifier}
		<strong><Identifier identifier={accountIdentifier.toHex()} /></strong>.
	</p>
{/if}

<p>
	{$i18n.mission_control.transfer_icp_info}
	<ExternalLink underline href="https://juno.build/docs/pricing#sending-icp-to-your-mission-control"
		>documentation</ExternalLink
	>.
</p>

<button on:click>{$i18n.core.close}</button>
