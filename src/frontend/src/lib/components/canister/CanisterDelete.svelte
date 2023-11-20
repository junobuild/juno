<script lang="ts">
	import CanisterAction from '$lib/components/canister/CanisterAction.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
    import type {Canister} from "$lib/types/canister";

    export let canister: Canister | undefined = undefined;
</script>

<CanisterAction {canister} on:click>
	<IconDelete />
	{$i18n.core.delete}
</CanisterAction>
