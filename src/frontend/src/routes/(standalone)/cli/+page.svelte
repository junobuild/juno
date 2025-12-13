<script lang="ts">
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CliAdd from '$lib/components/cli/CliAdd.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import MetadataLoader from '$lib/components/loaders/MetadataLoader.svelte';
	import SignInActions from '$lib/components/sign-in/SignInActions.svelte';
	import ContainerCentered from '$lib/components/ui/ContainerCentered.svelte';
	import Message from '$lib/components/ui/Message.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { onLayoutTitleIntersection } from '$lib/stores/app/layout-intersecting.store';
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
					{#if nonNullish($missionControlId)}
						<div in:fade>
							<CliAdd missionControlId={$missionControlId} {principal} {profile} {redirect_uri} />
						</div>
					{/if}
				</MetadataLoader>
			</MissionControlGuard>
		{:else}
			<ContainerCentered>
				<p>
					{$i18n.cli.sign_in}
				</p>

				<SignInActions />
			</ContainerCentered>
		{/if}
	{:else}
		<ContainerCentered>
			<Message>
				{#snippet icon()}
					<span>❌</span>
				{/snippet}

				<p>{$i18n.errors.cli_missing_params}</p>
			</Message>
		</ContainerCentered>
	{/if}
</div>

<style lang="scss">
	p {
		max-width: 450px;
	}
</style>
