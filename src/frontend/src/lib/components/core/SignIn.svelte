<script lang="ts">
	import DeprecatedSignIn from '$lib/components/core/DeprecatedSignIn.svelte';
	import IconIc from '$lib/components/icons/IconIC.svelte';
	import { signIn } from '$lib/services/auth.services';
	import { isBusy } from '$lib/stores/busy.store';
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

<div class="container">
	<div class="overview">
		<h1>{title}</h1>

		<p>{$i18n.sign_in.future}</p>
	</div>

	<div class="sign-in">
		<button onclick={async () => await signIn({})} disabled={$isBusy}
			><IconIc size="20px" />
			<span>{$i18n.sign_in.internet_identity}</span></button
		>

		<DeprecatedSignIn />
	</div>
</div>

<style lang="scss">
	@use '../../../lib/styles/mixins/media';

	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		text-align: center;

		min-height: calc(100vh - var(--header-height) - var(--footer-height) - var(--padding-8x));
	}

	h1 {
		color: var(--color-primary);
		padding: var(--padding-2x) 0 var(--padding);

		--bigger-title: 1;
		font-size: calc(var(--font-size-h1) * var(--bigger-title));

		max-width: 420px;

		@include media.min-width(large) {
			--bigger-title: 1.4;
			margin-top: var(--padding-8x);
		}
	}

	.sign-in {
		padding: var(--padding) 0 0;
	}

	button {
		font-size: var(--font-size-small);
	}
</style>
