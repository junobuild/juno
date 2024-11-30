<script lang="ts">
	import CanisterAction from '$lib/components/canister/CanisterAction.svelte';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterIcStatus } from '$lib/types/canister';

	interface Props {
		canister?: CanisterIcStatus | undefined;
		onclick: () => Promise<void>;
	}

	let { canister = undefined, onclick }: Props = $props();
</script>

<CanisterAction {canister} {onclick}>
	<IconDelete />
	{$i18n.core.delete}
</CanisterAction>
