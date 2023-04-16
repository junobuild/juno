<script lang="ts">
	import IconSignIn from '$lib/components/icons/IconSignIn.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { signIn } from '$lib/services/auth.services';
	import { isBusy } from '$lib/stores/busy.store';
	import AlreadyRegistered from '$lib/components/core/AlreadyRegistered.svelte';

	const redeemSignIn = async () => {
		// Close popover to prevent glitch on successful login
		visible = false;

		const { success } = await signIn({
			domain: 'internetcomputer.org',
		});

		if (success === 'ok') {
			return;
		}

		// In case logging was aborted or failed, reopen redeem popover since we hide it to avoid a glitch
		visible = true;
	};

	// TODO: remove popover
	let visible = false;
</script>

<div class="container">
	<div class="overview">
		<h1>{$i18n.sign_in.title}</h1>

		<p>{@html $i18n.sign_in.overview_1}</p>
		<p>{@html $i18n.sign_in.overview_2}</p>
		<p>{@html $i18n.sign_in.overview_3}</p>
	</div>

	<div class="sign-in">
		<button on:click={() => (visible = true)} disabled={$isBusy}
			><IconSignIn size="20px" />
			<span>Redeem invitation code</span></button
		>

		<div class="sign-in-now">
			<AlreadyRegistered>Already registered?&nbsp;</AlreadyRegistered>
		</div>
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
		padding: 0 0 var(--padding-4x);

		--bigger-title: 1.2;
		font-size: calc(var(--font-size-h1) * var(--bigger-title));
	}

	.sign-in {
		padding: var(--padding-4x) 0 0;
	}

	.content {
		padding: var(--padding-2x);

		form {
			margin: 0;
		}
	}

	.sign-in-now {
		padding: var(--padding-2x) 0;
		font-size: var(--font-size-very-small);
		max-width: 280px;
	}
</style>
