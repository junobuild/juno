<script lang="ts">
	import IconIC from '$lib/components/icons/IconIC.svelte';
	import IconNFID from '$lib/components/icons/IconNFID.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import type { User } from '$lib/types/user';
	import { formatToDate } from '$lib/utils/date.utils';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let { owner, created_at, data } = $derived(user);

	let { provider } = $derived(data);
</script>

<tr>
	<td></td>
	<td><Identifier small={false} identifier={owner.toText()} /></td>
	<td class="providers">
		{#if provider === 'internet_identity'}
			<IconIC title="Internet Identity" />
		{:else if provider === 'nfid'}
			<IconNFID />
		{/if}
	</td>
	<td class="created">{formatToDate(created_at)}</td>
</tr>

<style lang="scss">
	@use '../../styles/mixins/media';

	.providers {
		vertical-align: middle;
	}

	.providers {
		display: none;

		@include media.min-width(small) {
			display: table-cell;
		}
	}

	.created {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}
</style>
