<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { isBusy } from '$lib/stores/busy.store';
	import DeprecatedSignIn from '$lib/components/core/DeprecatedSignIn.svelte';
	import IconICMonochrome from '$lib/components/icons/IconICMonochrome.svelte';
	import { signIn } from '$lib/services/auth.services';
	import Container from '$lib/components/ui/Container.svelte';

	let quotes: string[];
	$: quotes = [
		$i18n.sign_in.quote_1,
		$i18n.sign_in.quote_2,
		$i18n.sign_in.quote_3,
		$i18n.sign_in.quote_4,
		$i18n.sign_in.quote_5,
		$i18n.sign_in.quote_6,
		$i18n.sign_in.quote_7,
		$i18n.sign_in.quote_8,
		$i18n.sign_in.quote_9,
		$i18n.sign_in.quote_10
	];

	let title: string;
	$: title = quotes[Math.floor(Math.random() * quotes.length)];

	const doSignIn = async (domain?: 'internetcomputer.org' | 'ic0.app') => {
		await signIn({ domain });
	};
</script>

<Container>
	{$i18n.sign_in.deprecated}
	<svelte:fragment slot="title">{title}</svelte:fragment>
	<svelte:fragment slot="actions">
		<button on:click={async () => await doSignIn()} disabled={$isBusy}
			><IconICMonochrome size="20px" />
			<span>{$i18n.sign_in.internet_identity}</span></button
		>

		<DeprecatedSignIn
			on:junoSignIn={async () => await doSignIn('internetcomputer.org')}
			on:junoSignInDeprecated={async () => await doSignIn('ic0.app')}
		/>
	</svelte:fragment>
</Container>
