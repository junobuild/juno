<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import CliAdd from '$lib/components/cli/CliAdd.svelte';
	import { signIn } from '$lib/services/auth.services';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';

	export let data: {
		redirect_uri: Option<string>;
		principal: Option<string>;
	};

	let redirect_uri: Option<string>;
	let principal: Option<string>;
	$: ({ redirect_uri, principal } = data);
</script>

{#if nonNullish(redirect_uri) && nonNullish(principal)}
	{#if $authSignedInStore}
		<CliAdd {principal} {redirect_uri} />
	{:else}
		<p>
			{$i18n.cli.sign_in}
		</p>

		<button on:click={async () => signIn({})}>{$i18n.core.sign_in}</button>
	{/if}
{:else}
	<p>{$i18n.errors.cli_missing_params}</p>
{/if}
