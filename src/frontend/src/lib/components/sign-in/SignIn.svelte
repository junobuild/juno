<script lang="ts">
	import SignInActions from '$lib/components/sign-in/SignInActions.svelte';
	import ContainerCentered from '$lib/components/ui/ContainerCentered.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	let quotes: string[] = $derived([
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
	]);

	let title: string = $derived(quotes[Math.floor(Math.random() * quotes.length)]);
</script>

<ContainerCentered>
	<h1>{title}</h1>

	{#snippet action()}
		<SignInActions />
	{/snippet}
</ContainerCentered>

<style lang="scss">
	@use '../../styles/mixins/media';

	h1 {
		padding: 0;

		--bigger-title: 1.2;
		font-size: calc(var(--font-size-h1) * var(--bigger-title));

		max-width: 420px;

		@include media.min-width(large) {
			--bigger-title: 1.4;
		}
	}
</style>
