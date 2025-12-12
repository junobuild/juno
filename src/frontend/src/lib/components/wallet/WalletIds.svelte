<script lang="ts">
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { toAccountIdentifier } from '$lib/utils/account.utils';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	const accountIdentifier = toAccountIdentifier({ owner: missionControlId });
</script>

<div>
	<Value>
		{#snippet label()}
			{$i18n.wallet.wallet_id}
		{/snippet}
		<Identifier
			identifier={missionControlId.toText()}
			shorten={false}
			small={false}
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
