<script lang="ts">
	import IconIc from '$lib/components/icons/IconIC.svelte';
	import IconNFID from '$lib/components/icons/IconNFID.svelte';
	import type { User } from '$lib/types/user';
	import IconPasskey from '$lib/components/icons/IconPasskey.svelte';

	interface Props {
		user: User;
		withText?: boolean;
	}

	let { user, withText = false }: Props = $props();

	let { data } = $derived(user);

	let { provider } = $derived(data);

	let size = $derived(withText ? '22px' : '24px');
</script>

{#if provider === 'internet_identity'}
	<IconIc title="Internet Identity" {size} />{#if withText}
		<span>Internet Identity</span>{/if}
{:else if provider === 'nfid'}
	<IconNFID withTitle {size} />{#if withText}
		<span>NFID</span>{/if}
{:else if provider === 'webauthn'}
	<IconPasskey withTitle {size} />{#if withText}
		<span>Passkey</span>{/if}
{/if}
