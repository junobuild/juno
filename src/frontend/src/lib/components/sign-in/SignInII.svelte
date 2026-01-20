<script lang="ts">
	import IconIc from '$lib/components/icons/IconIC.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { signInWithII } from '$lib/services/console/auth/auth.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { testId } from '$lib/utils/test.utils';
</script>

<button
	{...testId(testIds.auth.signInII)}
	aria-label={$i18n.sign_in.internet_identity}
	disabled={$isBusy}
	onclick={signInWithII}
	><IconIc size="20px" />
	<span>{$i18n.sign_in.internet_identity_short}</span></button
>

<style lang="scss">
	button {
		padding: var(--padding) var(--padding-3x);
	}
</style>
