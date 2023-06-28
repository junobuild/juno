<script lang="ts">
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { nonNullish } from '$lib/utils/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { signIn } from '$lib/services/auth.services';
	import CliAdd from '$lib/components/cli/CliAdd.svelte';

	export let data: {
		redirect_uri: string | null | undefined;
		principal: string | null | undefined;
	};

	let redirect_uri: string | null | undefined;
	let principal: string | null | undefined;
	$: ({ redirect_uri, principal } = data);
</script>

{#if nonNullish(redirect_uri) && nonNullish(principal)}
	<h1>{$i18n.cli.title}</h1>

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
