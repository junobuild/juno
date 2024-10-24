<script lang="ts">
	import CanisterAction from '$lib/components/canister/CanisterAction.svelte';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterIcStatus } from '$lib/types/canister';

	interface Props {
		canister?: CanisterIcStatus | undefined;
	}

	let { canister = undefined }: Props = $props();
</script>

<CanisterAction {canister} on:click>
	<IconDelete />
	{$i18n.core.delete}
</CanisterAction>
