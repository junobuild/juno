<script lang="ts">
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CliAdd from '$lib/components/cli/CliAdd.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import MetadataLoader from '$lib/components/loaders/MetadataLoader.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { signIn } from '$lib/services/auth/auth.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { onLayoutTitleIntersection } from '$lib/stores/layout-intersecting.store';
	import type { Option } from '$lib/types/utils';

	interface Props {
		data: {
			redirect_uri: Option<string>;
			principal: Option<string>;
			profile: Option<string>;
		};
	}

	let { data }: Props = $props();

	let redirect_uri = $derived(data?.redirect_uri);
	let principal = $derived(data?.principal);
	let profile = $derived(data?.profile);
</script>

<div onjunoIntersecting={onLayoutTitleIntersection} use:onIntersection>
	{#if nonNullish(redirect_uri) && nonNullish(principal) && notEmptyString(redirect_uri) && notEmptyString(principal)}
		{#if $authSignedIn}
			<MissionControlGuard>
				<MetadataLoader satellites={$sortedSatellites}>
					{#if nonNullish($missionControlIdDerived)}
						<div in:fade>
							<CliAdd
								missionControlId={$missionControlIdDerived}
								{principal}
								{profile}
								{redirect_uri}
							/>
						</div>
					{/if}
				</MetadataLoader>
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
</div>
