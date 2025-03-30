<script lang="ts">
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { signIn } from '$lib/services/auth.services';
	import { i18n } from '$lib/stores/i18n.store';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import Signer from '$lib/components/signer/Signer.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import {onLayoutTitleIntersection} from "$lib/stores/layout-intersecting.store";
</script>

<span use:onIntersection onjunoIntersecting={onLayoutTitleIntersection}></span>

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
