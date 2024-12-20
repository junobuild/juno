<script lang="ts">
	import CanisterAction from '$lib/components/canister/CanisterAction.svelte';
	import IconMoveUp from '$lib/components/icons/IconMoveUp.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterSyncData } from '$lib/types/canister';

	interface Props {
		canister?: CanisterSyncData | undefined;
		onclick: () => Promise<void>;
	}

	let { canister = undefined, onclick }: Props = $props();
</script>

<CanisterAction {canister} {onclick}>
	<IconMoveUp />
	{$i18n.canisters.transfer_cycles_action}
</CanisterAction>
