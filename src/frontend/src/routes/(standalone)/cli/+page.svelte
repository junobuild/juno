<script lang="ts">
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import CliAdd from '$lib/components/cli/CliAdd.svelte';
	import MissionControlGuard from '$lib/components/guards/MissionControlGuard.svelte';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { signIn } from '$lib/services/auth.services';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Option } from '$lib/types/utils';

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

{#if nonNullish(redirect_uri) && nonNullish(principal) && notEmptyString(redirect_uri) && notEmptyString(principal)}
	{#if $authSignedInStore}
		<MissionControlGuard>
			{#if nonNullish($missionControlStore)}
				<CliAdd {principal} {redirect_uri} missionControlId={$missionControlStore} />
			{/if}
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
