<script lang="ts">
	import IconGitHub from '$lib/components/icons/IconGitHub.svelte';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { signInWithGitHub } from '$lib/services/console/auth/auth.openid.services';
	import { i18n } from '$lib/stores/app/i18n.store';
</script>

<button disabled={$isBusy} onclick={signInWithGitHub}
	><IconGitHub size="20px" />
	<span>{$i18n.sign_in.github}</span></button
>

<style lang="scss">
	button {
		width: 100%;
		padding: var(--padding) var(--padding-3x);
	}
</style>
