<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { signIn } from '$lib/services/auth/auth.services';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	const dispatch = createEventDispatcher();

	const doSignIn = async (domain: 'internetcomputer.org' | 'ic0.app') => {
		dispatch('junoSignIn');
		await signIn({ domain });
	};

	let visible = $state(false);
</script>

<p class="help">
	Need help <button class="text action" disabled={$isBusy} onclick={() => (visible = true)}
		>signing in?</button
	>
</p>

<Popover center={true} bind:visible>
	<div class="content">
		<p class="sign-in-now">
			{$i18n.sign_in.juno_defaults_to}
			<button
				class="text action"
				disabled={$isBusy}
				onclick={async () => await doSignIn('internetcomputer.org')}>internetcomputer.org</button
			>
			{$i18n.sign_in.for_authentication}
		</p>

		<p>
			{$i18n.sign_in.alternatively}
			<button class="text action" disabled={$isBusy} onclick={async () => await doSignIn('ic0.app')}
				>ic0.app</button
			>.
		</p>

		<p>
			{$i18n.sign_in.if_neither_works}
			<ExternalLink arrow={false} href="https://discord.gg/wHZ57Z2RAG" underline
				>Discord</ExternalLink
			>.
		</p>

		<div class="toolbar">
			<button onclick={() => (visible = false)} type="button">{$i18n.core.close}</button>
		</div>
	</div>
</Popover>

<style lang="scss">
	.help {
		font-size: var(--font-size-ultra-small);
	}

	.action {
		margin: 0;
	}

	.help {
		margin: 0;
	}

	.content {
		display: flex;
		flex-direction: column;

		padding: var(--padding-2x);

		p {
			text-align: left;
		}
	}
</style>
