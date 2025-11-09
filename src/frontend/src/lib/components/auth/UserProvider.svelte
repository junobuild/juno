<script lang="ts">
	import IconGoogle from '$lib/components/icons/IconGoogle.svelte';
	import IconIc from '$lib/components/icons/IconIC.svelte';
	import IconNFID from '$lib/components/icons/IconNFID.svelte';
	import IconPasskey from '$lib/components/icons/IconPasskey.svelte';
	import type { User } from '$lib/types/user';

	interface Props {
		user: User;
		withText?: boolean;
	}

	let { user, withText = false }: Props = $props();

	let { data } = $derived(user);

	let { provider } = $derived(data);

	let size = $derived(withText ? '20px' : '22px');
</script>

{#if provider === 'internet_identity'}
	<span class="align-center"
		><IconIc {size} title="Internet Identity" />{#if withText}
			<span>Internet Identity</span>{/if}</span
	>
{:else if provider === 'google'}
	<span class="align-center"
		><IconGoogle size="18px" withTitle />{#if withText}
			<span>Google</span>{/if}</span
	>
{:else if provider === 'nfid'}
	<span class="align-center"
		><IconNFID {size} withTitle />{#if withText}
			<span>NFID</span>{/if}</span
	>
{:else if provider === 'webauthn'}
	<span class="align-center"
		><IconPasskey {size} withTitle />{#if withText}
			<span>Passkey</span>{/if}</span
	>
{/if}

<style lang="scss">
	.align-center {
		display: flex;
		align-items: center;
		gap: var(--padding);
	}
</style>
