<script lang="ts">
	import SignInHelp from '$lib/components/core/SignInHelp.svelte';
	import IconIc from '$lib/components/icons/IconIC.svelte';
	import { signIn } from '$lib/services/auth/auth.services';
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
	</div>

	<div class="sign-in">
		<button onclick={async () => await signIn({})} disabled={$isBusy}
			><IconIc size="20px" />
			<span>{$i18n.sign_in.internet_identity}</span></button
		>
	</div>
</div>

<div class="pre-footer">
	<SignInHelp />
</div>

<style lang="scss">
	@use '../../../lib/styles/mixins/media';

	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		text-align: center;

		min-height: calc(100vh - var(--header-height) - var(--padding-8x));
		padding: 0 0 var(--padding-12x);
	}

	h1 {
		padding: 0;

		--bigger-title: 1.2;
		font-size: calc(var(--font-size-h1) * var(--bigger-title));

		max-width: 420px;

		@include media.min-width(large) {
			--bigger-title: 1.4;
		}
	}

	.sign-in {
		padding: var(--padding) 0 0;
	}

	button {
		padding: var(--padding) var(--padding-2x);
	}

	.pre-footer {
		display: flex;
		justify-content: center;
	}
</style>
