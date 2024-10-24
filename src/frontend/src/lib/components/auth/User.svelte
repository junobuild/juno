<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { Principal } from '@dfinity/principal';
	import IconIC from '$lib/components/icons/IconIC.svelte';
	import IconNFID from '$lib/components/icons/IconNFID.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import type { Provider, User, UserData } from '$lib/types/user';
	import { formatToDate } from '$lib/utils/date.utils';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let owner: Principal = $state();
	let created_at: bigint = $state();
	let updated_at: bigint = $state();
	let data: UserData = $state();

	run(() => {
		({ owner, created_at, updated_at, data } = user);
	});

	let provider: Provider | undefined = $state();
	run(() => {
		({ provider } = data);
	});
</script>

<tr>
	<td><Identifier small={false} identifier={owner.toText()} /></td>
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
