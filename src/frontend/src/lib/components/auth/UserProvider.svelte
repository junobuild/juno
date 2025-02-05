<script lang="ts">
	import IconIC from '$lib/components/icons/IconIC.svelte';
	import IconNFID from '$lib/components/icons/IconNFID.svelte';
	import type { User } from '$lib/types/user';

	interface Props {
		user: User;
		withText?: boolean;
	}

	let { user, withText = false }: Props = $props();

	let { data } = $derived(user);

	let { provider } = $derived(data);
</script>

{#if provider === 'internet_identity'}
	<IconIC title="Internet Identity" />{#if withText}
		Internet Identity{/if}
{:else if provider === 'nfid'}
	<IconNFID />{#if withText}
		NFID{/if}
{/if}
