<script lang="ts">
	import { getAccountIdentifier } from '$lib/api/icp-index.api';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	const accountIdentifier = getAccountIdentifier(missionControlId);
</script>

<div>
	<Value>
		{#snippet label()}
			{$i18n.wallet.wallet_id}
		{/snippet}
		<Identifier
			shorten={false}
			small={false}
			identifier={missionControlId.toText()}
			what={$i18n.wallet.wallet_id}
		/>
	</Value>
</div>

<div>
	<Value>
		{#snippet label()}
			{$i18n.wallet.account_identifier}
		{/snippet}
		<Identifier
			identifier={accountIdentifier?.toHex() ?? ''}
			small={false}
			what={$i18n.wallet.account_identifier}
		/>
	</Value>
</div>
