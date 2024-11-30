<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import CliAdd from '$lib/components/cli/CliAdd.svelte';
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

	let redirect_uri: Option<string> = $state();
	let principal: Option<string> = $state();
	run(() => {
		({ redirect_uri, principal } = data);
	});
</script>

{#if nonNullish(redirect_uri) && nonNullish(principal)}
	{#if $authSignedInStore}
		<CliAdd {principal} {redirect_uri} />
	{:else}
		<p>
			{$i18n.cli.sign_in}
		</p>

		<button onclick={async () => await signIn({})}>{$i18n.core.sign_in}</button>
	{/if}
{:else}
	<p>{$i18n.errors.cli_missing_params}</p>
{/if}
