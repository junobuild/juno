<script lang="ts">
	import CanisterAction from '$lib/components/canister/CanisterAction.svelte';
	import IconMoveUp from '$lib/components/icons/IconMoveUp.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterIcStatus } from '$lib/types/canister';

	interface Props {
		canister?: CanisterIcStatus | undefined;
	}

	let { canister = undefined }: Props = $props();
</script>

<CanisterAction {canister} on:click>
	<IconMoveUp />
	{$i18n.canisters.transfer_cycles}
</CanisterAction>
