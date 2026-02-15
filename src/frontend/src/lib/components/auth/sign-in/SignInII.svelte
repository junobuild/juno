<script lang="ts">
	import IconIc from '$lib/components/icons/IconIC.svelte';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { signInWithII } from '$lib/services/console/auth/auth.services';
	import { i18n } from '$lib/stores/app/i18n.store';
</script>

<button aria-label={$i18n.sign_in.internet_identity} disabled={$isBusy} onclick={signInWithII}
	><IconIc size="20px" />
	<span>{$i18n.sign_in.internet_identity_short}</span></button
>

<style lang="scss">
	button {
		padding: var(--padding) var(--padding-3x);
	}
</style>
