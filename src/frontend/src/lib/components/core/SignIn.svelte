<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { toasts } from '$lib/stores/toasts.store';
	import IconSignIn from '$lib/components/icons/IconSignIn.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { createEventDispatcher } from 'svelte';

	let inProgress = false;

	const dispatch = createEventDispatcher();

	const signIn = async () => {
		try {
			await authStore.signIn(invitationCode !== '' ? invitationCode : undefined);

			dispatch('junoClose');
		} catch (err: unknown) {
			toasts.error({
				text: `Something went wrong while sign-in.`,
				detail: err
			});
		}

		visible = false;
	};

	let visible = false;
	let invitationCode = '';
</script>

<div class="container">
	<div class="overview">
		<h1>{$i18n.sign_in.title}</h1>

		<p>{@html $i18n.sign_in.overview_1}</p>
		<p>{@html $i18n.sign_in.overview_2}</p>
		<p>{@html $i18n.sign_in.overview_3}</p>
	</div>

	<div class="sign-in">
		<button on:click={() => (visible = true)} disabled={inProgress}
			><IconSignIn />
			<span>Redeem invitation code</span></button
		>

		<p class="sign-in-now">
			Already registered?<button class="text" on:click={signIn} disabled={inProgress}
				>Sign-in now</button
			>
		</p>
	</div>
</div>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		<h3>Redeem code</h3>

		<p>
			Join Juno's <strong>closed beta</strong> with an invitation code or reach out to
			<a
				aria-label="Reach out David on Twitter"
				href="https://twitter.com/daviddalbusco"
				rel="external noopener noreferrer"
				target="_blank"
			>
				David
			</a> to request one.
		</p>

		<p>Sign in using Internet Identity once you have your code.</p>

		<form on:submit|preventDefault={signIn}>
			<input
				bind:value={invitationCode}
				aria-label="Invitation code"
				name="invitation-code"
				placeholder="Invitation code"
				type="text"
				required
			/>

			<button type="submit" disabled={inProgress}>
				<IconSignIn /> Redeem by signing in
			</button>
		</form>
	</div>
</Popover>

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

	.sign-in-now {
		font-size: var(--font-size-very-small);
		padding: var(--padding) 0 0;
	}

	.content {
		padding: var(--padding-2x) var(--padding);

		form {
			margin: 0;
		}
	}
</style>
