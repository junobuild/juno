<script lang="ts">
	import IconIc from '$lib/components/icons/IconIC.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { signIn } from '$lib/services/auth/auth.services';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { testId } from '$lib/utils/test.utils';
</script>

<button {...testId(testIds.auth.signIn)} disabled={$isBusy} onclick={async () => await signIn({})}
	><IconIc size="20px" />
	<span>{$i18n.sign_in.internet_identity}</span></button
>

<style lang="scss">
	button {
		padding: var(--padding) var(--padding-2x);
	}
</style>
