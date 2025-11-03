<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import IconGoogle from '$lib/components/icons/IconGoogle.svelte';
	import { GOOGLE_CLIENT_ID } from '$lib/constants/app.constants';
	import { signInWithGoogle } from '$lib/services/auth/auth.openid.services';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
</script>

{#if nonNullish(GOOGLE_CLIENT_ID)}
	<button disabled={$isBusy} onclick={signInWithGoogle}
		><IconGoogle size="20px" />
		<span>{$i18n.sign_in.google}</span></button
	>
{/if}

<style lang="scss">
	button {
		width: 100%;
		padding: var(--padding) var(--padding-3x);
	}
</style>
