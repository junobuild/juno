<script lang="ts">
	import type { Provider, User, UserData } from '$lib/types/user';
	import { formatToDate } from '$lib/utils/date.utils';
	import type { Principal } from '@dfinity/principal';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import IconIC from '$lib/components/icons/IconIC.svelte';
	import IconNFID from '$lib/components/icons/IconNFID.svelte';

	export let user: User;

	let owner: Principal;
	let created_at: bigint;
	let updated_at: bigint;
	let data: UserData;

	$: ({ owner, created_at, updated_at, data } = user);

	let provider: Provider | undefined;
	$: ({ provider } = data);
</script>

<tr>
	<td><Identifier identifier={owner.toText()} /></td>
	<td class="providers">
		{#if provider === 'internet_identity'}
			<IconIC title="Internet Identity" />
		{:else if provider === 'nfid'}
			<IconNFID />
		{/if}
	</td>
	<td>{formatToDate(created_at)}</td>
	<td>{formatToDate(updated_at)}</td>
</tr>

<style lang="scss">
	.providers {
		vertical-align: middle;
	}
</style>
