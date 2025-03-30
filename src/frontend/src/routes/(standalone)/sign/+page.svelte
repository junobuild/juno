<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { onDestroy, setContext } from 'svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import Signer from '$lib/components/signer/Signer.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { signIn } from '$lib/services/auth.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { onLayoutTitleIntersection } from '$lib/stores/layout-intersecting.store';
	import { initSignerContext, SIGNER_CONTEXT_KEY } from '$lib/stores/signer.store';
	import type { OptionIdentity } from '$lib/types/itentity';

	const { idle, reset, ...context } = initSignerContext();
	setContext(SIGNER_CONTEXT_KEY, {
		...context,
		idle,
		reset
	});

	const init = (owner: OptionIdentity) => {
		if (isNullish(owner)) {
			reset();
			return;
		}

		context.init({ owner });
	};

	onDestroy(reset);

	$effect(() => {
		init($authStore.identity);
	});
</script>

<div class="section" use:onIntersection onjunoIntersecting={onLayoutTitleIntersection}>
	{#if $authSignedIn}
		<MissionControlGuard>
			{#if nonNullish($missionControlIdDerived)}
				<Signer missionControlId={$missionControlIdDerived} />
			{/if}
		</MissionControlGuard>
	{:else}
		<p>{$i18n.signer.access_your_wallet}</p>

		<button onclick={async () => await signIn({})}>{$i18n.core.sign_in}</button>
	{/if}
</div>

<style lang="scss">
	.section {
		--spinner-paragraph-margin: 0;
	}
</style>
