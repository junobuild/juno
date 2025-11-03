<script lang="ts">
	import IconGoogle from '$lib/components/icons/IconGoogle.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { signInWithGoogle } from '$lib/services/auth/auth.services';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { testId } from '$lib/utils/test.utils';
</script>

<button {...testId(testIds.auth.signIn)} disabled={$isBusy} onclick={signInWithGoogle}
	><IconGoogle size="20px" />
	<span>{$i18n.sign_in.google}</span></button
>

<style lang="scss">
	button {
		width: 100%;
		padding: var(--padding) var(--padding-3x);
	}
</style>
