<script lang="ts">
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CliAdd from '$lib/components/cli/CliAdd.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import CanistersLoader from '$lib/components/loaders/CanistersLoader.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
	import { signIn } from '$lib/services/auth.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Option } from '$lib/types/utils';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import {onLayoutTitleIntersection} from "$lib/stores/layout-intersecting.store";

	interface Props {
		data: {
			redirect_uri: Option<string>;
			principal: Option<string>;
		};
	}

	let { data }: Props = $props();

	let redirect_uri: Option<string> = $derived(data?.redirect_uri);
	let principal: Option<string> = $derived(data?.principal);
</script>

<span use:onIntersection onjunoIntersecting={onLayoutTitleIntersection}></span>

{#if nonNullish(redirect_uri) && nonNullish(principal) && notEmptyString(redirect_uri) && notEmptyString(principal)}
	{#if $authSignedIn}
		<MissionControlGuard>
			<CanistersLoader satellites={$sortedSatellites}>
				{#if nonNullish($missionControlIdDerived)}
					<div in:fade>
						<CliAdd {principal} {redirect_uri} missionControlId={$missionControlIdDerived} />
					</div>
				{/if}
			</CanistersLoader>
		</MissionControlGuard>
	{:else}
		<p>
			{$i18n.cli.sign_in}
		</p>

		<button onclick={async () => await signIn({})}>{$i18n.core.sign_in}</button>
	{/if}
{:else}
	<p>{$i18n.errors.cli_missing_params}</p>
{/if}
