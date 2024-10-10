<script lang="ts">
	import { signIn } from '$lib/services/auth.services.js';
	import DeprecatedSignIn from '$lib/components/core/DeprecatedSignIn.svelte';
	import IconSignIn from '$lib/components/icons/IconSignIn.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Container from '$lib/components/ui/Container.svelte';

	const redeemSignIn = async (domain?: 'internetcomputer.org' | 'ic0.app') => {
		// Close popover to prevent glitch on successful login
		visible = false;

		const { success } = await signIn({
			domain,
			invitationCode
		});

		if (success === 'ok') {
			return;
		}

		// In case logging was aborted or failed, reopen redeem popover since we hide it to avoid a glitch
		visible = true;
	};

	let visible = false;
	let invitationCode = '';
</script>

<Container>
	Enter your code to join Juno and start building.
	<svelte:fragment slot="title">Unlock Your Invitation</svelte:fragment>
	<svelte:fragment slot="actions">
		<button on:click={() => (visible = true)} disabled={$isBusy}
			><IconSignIn size="20px" />
			<span>Redeem invitation code</span></button
		>
	</svelte:fragment>
</Container>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		<h3>Redeem code</h3>

		<p>Enter your code to sign in and join Juno.</p>

		<input
			bind:value={invitationCode}
			aria-label="Invitation code"
			name="invitation-code"
			placeholder="Invitation code"
			type="text"
			required
		/>

		<button type="submit" disabled={$isBusy} on:click={async () => await redeemSignIn()}>
			<IconSignIn size="20px" /> <span>Redeem by signing in</span>
		</button>

		<DeprecatedSignIn
			on:junoSignIn={async () => await redeemSignIn('internetcomputer.org')}
			on:junoSignInDeprecated={async () => await redeemSignIn('ic0.app')}
		/>
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
	}
</style>
