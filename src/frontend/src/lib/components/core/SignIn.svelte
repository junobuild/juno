<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { isBusy } from '$lib/stores/busy.store';
	import DeprecatedSignIn from '$lib/components/core/DeprecatedSignIn.svelte';
	import IconICMonochrome from '$lib/components/icons/IconICMonochrome.svelte';
	import { signIn } from '$lib/services/auth.services';
</script>

<div class="container">
	<div class="overview">
		<h1>{$i18n.sign_in.title}</h1>

		<p>{@html $i18n.sign_in.overview_1}</p>
		<p>{@html $i18n.sign_in.overview_2}</p>
		<p>{@html $i18n.sign_in.overview_3}</p>
	</div>

	<div class="sign-in">
		<button on:click={async () => await signIn({})} disabled={$isBusy}
			><IconICMonochrome size="20px" />
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

		min-height: calc(100vh - var(--header-height) - var(--footer-height) - var(--padding-8x));

		grid-column: span 12 / auto;

		@include media.min-width(large) {
			grid-column: span 6 / auto;
		}

		@include media.min-width(xlarge) {
			grid-column: span 5 / auto;
		}
	}

	h1 {
		color: var(--color-primary);
		padding: 0 0 var(--padding-3x);

		--bigger-title: 1.2;
		font-size: calc(var(--font-size-h1) * var(--bigger-title));
	}

	.sign-in {
		padding: var(--padding-1_5x) 0 0;
	}

	.content {
		padding: var(--padding-2x);

		form {
			margin: 0;
		}
	}
</style>
