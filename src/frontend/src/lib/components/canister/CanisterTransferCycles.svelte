<script lang="ts">
	import CanisterAction from '$lib/components/canister/CanisterAction.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import IconMoveUp from '$lib/components/icons/IconMoveUp.svelte';
	import type {Canister} from "$lib/types/canister";

	export let canister: Canister | undefined = undefined;
</script>

<CanisterAction {canister} on:click>
	<IconMoveUp />
	{$i18n.canisters.transfer_cycles}
</CanisterAction>
