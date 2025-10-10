<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { nonNullish } from '@dfinity/utils';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		accountIdentifier: AccountIdentifier | undefined;
		onclose: () => void;
	}

	let { accountIdentifier, onclose }: Props = $props();
</script>

{#if nonNullish($missionControlIdDerived) && nonNullish(accountIdentifier)}
	<p class="account-identifier">
		{$i18n.wallet.transfer_to_account_identifier}
		<strong><Identifier identifier={accountIdentifier.toHex()} small={false} /></strong>.
	</p>
{/if}

<p>
	{$i18n.wallet.transfer_icp_info}
	<ExternalLink href="https://juno.build/docs/miscellaneous/wallet" underline
		>documentation</ExternalLink
	>.
</p>

<button onclick={onclose} {...testId(testIds.wizard.closeInsufficientFunds)}
	>{$i18n.core.close}</button
>

<style lang="scss">
	.account-identifier {
		margin: 0;
	}
</style>
